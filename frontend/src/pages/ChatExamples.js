import React from 'react';
import { buildPathWs, buildPath } from '../components/Path';
import axios from "axios";

const { useState, useRef } = React;

class ChatListener
{
    /**
     * Constructs a new chat listener object.
     * 
     * @param jwt The non-decoded JWT identifying the user which is received on login.
     */
    constructor(jwt) 
    {
        console.log("New chat listener");

        this.ws = new WebSocket(buildPathWs());
        this.ws.chat = {};
        this.ws.chat.callbacks = [];
        this.ws.chat.channel = "";
        this.ws.chat.jwt = jwt;

        this.ws.addEventListener('open', (event) => 
        {
            const identify = 
            {
                JwtToken: jwt,
                Channel: ""
            };
            this.ws.send(JSON.stringify(identify));
        });

        this.ws.addEventListener('message', (event) => 
        {
            try
            {
                let json = JSON.parse(event.data);

                // Ignore if not from our active channel
                if (json.ChannelId !== this.ws.chat.channel)
                {
                    return;
                }

                // Run callbacks
                this.ws.chat.callbacks.forEach((callback) => 
                {
                    callback(json);
                });
            }
            catch (e) 
            {
                console.log("Chat error: " + e.toString());
            }
        });
    }

    /** 
     * Sets the active channel for the user. Users will only receive messages from their active
     * channel.
     * 
     * @param channel The ID of the channel to connect to.
     */
    setActiveChannel(channel)
    {
        this.ws.chat.channel = channel;
        const setChannel = 
        {
            JwtToken: this.ws.chat.jwt,
            Channel: this.ws.chat.channel
        };
        this.ws.send(JSON.stringify(setChannel));
    }

    /**
     * Sends a message to the active channel. If no active channel was set, the message will
     * not be sent.
     * 
     * @param token The access token of the user.
     * @param message Contents of the message to send.
     */
    sendMessage(token, message)
    {
        // Must be in a channel
        if (this.ws.chat.channel === "")
        {
            return;
        }

        // Message cannot be empty
        if (message.length === 0) {
            return;
        }

        axios
            .post(buildPath("api/sendmessage"), {
                Channel: this.ws.chat.channel,
                Message: message,
                JwtToken: token
            })
            .then((res) => {
                if (res.data.Error !== null) {
                    throw res.data.Error;
                }
            })
    }

    /**
     * Adds a new listener callback function to receive chat messages. 
     * 
     * @param callback A function that receives a chat message object. The message object received
     * is of the following form:
     * 
     * {
     *  SenderId: "A string with the user ID of the person sending the message.",
     *  ChannelId: "A string containing the ID of the channel the message was sent in."
     *  Content: "A string containing the contents of the message."
     *  DateCreated: "A `Date` object for when the message was sent. This can be used to implement 
     *               strict ordering of messages."
     * }
     * 
     * This is the same form as messages received from the `getmessages` endpoint.
     * 
     * Example Usage:
     * ```
     * chatListener.addListener(function(msg) {
     *  console.log(msg.SenderId + " sent a message in the " + msg.ChannelId + "channel!");
     *  console.log("The message says: " + msg.Message);
     * });
     * 
     * ```
     */
    addListener(callback)
    {
        this.ws.chat.callbacks.push(callback);
    }
}

// This initializes the chat with the users JWT
const chat = new ChatListener(localStorage.getItem('access_token'));



const ChatExamples = () =>
{
    const msgRef = useRef(null);
    const channelRef = useRef(null);
    const channelTitleRef = useRef(null);
    const [ channels, setChannels ] = useState([]);
    const [ messages, setMessages ] = useState([]);
    const [ msgInput, setMsgInput ] = useState('');
    const [ channelInput, setChannelInput ] = useState('');
    const [ channelTitleInput, setChannelTitleInput ] = useState('');

    // This is a callback that listens for new messages from the server
    chat.addListener(function (msg) {
        // Set the messages to be whatever they were + the new message.
        setMessages([...messages, msg.Content]);
    });

    function handleMsgChange(e) {
        setMsgInput(e.target.value);
    }

    function handleChannelChange(e) {
        setChannelInput(e.target.value);
    }

    function handleChannelTitleChange(e) {
        setChannelTitleInput(e.target.value);
    }

    const sendMessage = async event => {
        event.preventDefault();

        // Send the message to the server.
        // NOTE: We don't need to add our message to the message list because once the server reads
        // it, it will be rebroadcasted back to us.
        chat.sendMessage(
            localStorage.getItem("access_token"),
            msgInput
        );
    };

    const getChannels = async event => {
        event.preventDefault();

        axios
            .post(buildPath("api/getchannels"), {
                JwtToken: localStorage.getItem("access_token")
            })
            .then((res) => {
                if (res.data.Error !== null) {
                    throw res.data.Error;
                }

                setChannels(res.data.Channels);
            })
            .catch((error) => {
                console.error(error.toString());
            });
    };

    const setChannel = async event => {
        event.preventDefault();

        chat.setActiveChannel(channelInput);

        // Get messages from the channel we are in
        axios
            .post(buildPath("api/getmessages"), {
                Channel: channelInput,
                JwtToken: localStorage.getItem("access_token"),
                Count: 50,
                // NOTE: When adding lazy-loading, the before date should initially be whatever
                // the current time is. Subsequent loads should be the `DateCreated` within the
                // oldest message returned from `getmessages`.
                Before: Date.now()
            })
            .then((res) => {
                if (res.data.Error !== null) {
                    throw res.data.Error;
                }

                // NOTE: Messages are returned in reverse order, so we must reverse
                // the messages as we append them
                let newMessages = [];
                res.data.Messages.slice().reverse().forEach((msg) => {
                    newMessages.push(msg.Content);
                });

                setMessages(newMessages);
            })
            .catch((error) => {
                console.error(error.toString());
            });
    };

    const newChannel = async event => {
        event.preventDefault();

        axios
            .post(buildPath("api/createchannel"), {
                Title: channelTitleInput,
                JwtToken: localStorage.getItem("access_token"),
            })
            .then((res) => {
                if (res.data.Error !== null) {
                    throw res.data.Error;
                }
            })
            .catch((error) => {
                console.error(error.toString());
            });
    };

    return(
        <div>
            <ul id="ChatList">
                {
                    messages.map((message, i) => {
                        return <li key={i}>{message}</li>
                    })
                }
            </ul>
            <div>
                <input type="text" onChange={handleMsgChange} ref={msgRef}></input>
                <button type="button" onClick={sendMessage}>Send</button>
            </div>
            <div>
                <input type="text" onChange={handleChannelChange} ref={channelRef}></input>
                <button type="button" onClick={setChannel}>Set Channel</button>
            </div>
            <div>
                <h1>New Channel</h1>
                <input type="text" onChange={handleChannelTitleChange} ref={channelTitleRef}></input>
                <button type="button" onClick={newChannel}>Create Channel</button>

                <h1>Channels</h1>
                <button type="button" onClick={getChannels}>Get Channels</button>
                <ul id="ChannelList">
                {
                    channels.map((message, i) => {
                        return <li key={i}>{message}</li>
                    })
                }
                </ul>
            </div>
        </div>
    );
}

export default ChatExamples;
