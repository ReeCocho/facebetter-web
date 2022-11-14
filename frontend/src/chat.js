import { buildPathWs, buildPath } from './components/Path';
import axios from "axios";

export class ChatListener
{
    /**
     * Constructs a new chat listener object.
     * 
     * @param accessToken The non-decoded token identifying the user which is received on login.
     */
    constructor(accessToken) 
    {
        console.log("New chat listener");

        this.ws = new WebSocket(buildPathWs());
        this.ws.chat = {};
        this.ws.chat.callbacks = [];
        this.ws.chat.channel = "";
        this.ws.chat.jwt = accessToken;

        this.ws.addEventListener('open', (event) => 
        {
            const identify = 
            {
                JwtToken: accessToken,
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
                this.ws.chat.callback(json);
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
     * Sets the listener callback function to receive chat messages. 
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
     * chatListener.setListener(function(msg) {
     *  console.log(msg.SenderId + " sent a message in the " + msg.ChannelId + "channel!");
     *  console.log("The message says: " + msg.Message);
     * });
     * 
     * ```
     */
    setListener(callback)
    {
        this.ws.chat.callback = callback;
    }
}
