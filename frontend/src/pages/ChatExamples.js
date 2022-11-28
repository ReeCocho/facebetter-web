import React from "react";
import { buildPath } from "../components/Path";
import axios from "axios";
import { ChatListener } from "../chat";
import "./ChatExamples.css";

/**
 * HOW TO USE:
 *
 * 1. Go to `http://localhost:3000/` and login to an account. Note that you might need to register
 *    a new testing account if you are having issues with chat features.
 *
 * 2. Do NOT close the browser. Navigate to `http://localhost:3000/pages/ChatExamples` in a
 *    new tab.
 *
 * 3. Type in a name for a new channel in the input field next to `Create Channel`. Then press
 *    the `Create Channel` button.
 *
 * 4. Press the `Get Channels` button to get the ID for the channel you just created.
 *
 * 5. Copy and paste the ID of the channel into the field next to `Set Channel`. Then press the
 *    `Set Channel` button.
 *
 * 6. Type in a message next to the `Send Message` field and then press the button. You should
 *    see the message pop up.
 *
 * 7. From here, you can open new tabs to the same url `http://localhost:3000/pages/ChatExamples`
 *    and see that messages are updated in both tabs. You can also create new channels and send
 *    messages in them. There is currently no way to join an existing channel. I will add this
 *    endpoint soon.
 *
 * NOTES:
 * - It is important that you use the `useRef` API to hold the `ChatListener` object. If you don't,
 *   multiple instances of the listener can be instantiated which will result in duplicate messages
 *   being received.
 * - Read the other comments in here. They have implementation notes that might be useful.
 * - The API is documented in `/frontend/src/chat.js`.
 */

const { useState, useRef, useEffect } = React;

const ChatExamples = ({ theInput }) => {
  const msgRef = useRef(null);
  const channelRef = useRef(null);
  const channelTitleRef = useRef(null);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [channelInput, setChannelInput] = useState("");
  const [channelTitleInput, setChannelTitleInput] = useState("");
  const chat = useRef(null);

  useEffect(() => {
    // This initializes the chat once on page load
    if (chat.current === null) {
      // The chat listener requires the JWT access token during intialization
      chat.current = new ChatListener(
        localStorage.getItem("access_token"),
        theInput
      );
      axios
        .post(buildPath("api/getmessages"), {
          Channel: theInput,
          JwtToken: localStorage.getItem("access_token"),
          Count: 50,
          // NOTE: When adding lazy-loading, the before date should initially be whatever
          // the current time is. Subsequent loads should be the `DateCreated` within the
          // oldest message returned from `getmessages`.
          Before: Date.now(),
        })
        .then((res) => {
          if (res.data.Error !== null) {
            throw res.data.Error;
          }

          // NOTE: Messages are returned in reverse order, so we must reverse
          // the messages before we append them
          let newMessages = [];
          res.data.Messages.slice()
            .reverse()
            .forEach((msg) => {
              newMessages.push(msg);
            });

          setMessages(newMessages);
        })
        .catch((error) => {
          console.error(error.toString());
        });

      document.addEventListener("Rerender", (e) => {
        console.log("repeatTwice")
        chat.current.setActiveChannel(e.detail.id);
        // console.log(e.detail.id)

        // Get messages from the channel we are in
        axios
          .post(buildPath("api/getmessages"), {
            Channel: e.detail.id,
            JwtToken: localStorage.getItem("access_token"),
            Count: 50,
            // NOTE: When adding lazy-loading, the before date should initially be whatever
            // the current time is. Subsequent loads should be the `DateCreated` within the
            // oldest message returned from `getmessages`.
            Before: Date.now(),
          })
          .then((res) => {
            if (res.data.Error !== null) {
              throw res.data.Error;
            }

            // NOTE: Messages are returned in reverse order, so we must reverse
            // the messages before we append them
            let newMessages = [];
            res.data.Messages.slice()
              .reverse()
              .forEach((msg) => {
                newMessages.push(msg);
              });
            setMessages(newMessages);
          })
          .catch((error) => {
            console.error(error.toString());
          });
      });
    }
    console.log("repeat")
  },[messages]);

  useEffect(() => {
    
    // This is a callback that listens for new messages from the server
    chat.current.setListener(function (msg) {
        // Set the messages to be whatever they were + the new message.
        // NOTE: It is technically possible for messages to arrive out of order.
        // You can use the `DateCreated` field to sort incoming messages to ensure
        // strict ordering.
        setMessages([...messages, msg]);
      });
  }, [messages]);

  function handleMsgChange(e) {
    setMsgInput(e.target.value);
  }

  function handleChannelChange(e) {
    setChannelInput(e.target.value);
  }

  function handleChannelTitleChange(e) {
    setChannelTitleInput(e.target.value);
  }

  const sendMessage = async (event) => {
    event.preventDefault();

    // Send the message to the server.
    // NOTE: We don't need to add our message to the message list because once the server reads
    // it, it will be rebroadcasted back to us.
    chat.current.sendMessage(localStorage.getItem("access_token"), msgInput);
  };

  const getChannels = async (event) => {
    event.preventDefault();

    // This gets all the channels the user is in
    axios
      .post(buildPath("api/getchannels"), {
        JwtToken: localStorage.getItem("access_token"),
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

  const setChannel = async (event) => {
    event.preventDefault();

    chat.current.setActiveChannel(channelInput);

    // Get messages from the channel we are in
    axios
      .post(buildPath("api/getmessages"), {
        Channel: channelInput,
        JwtToken: localStorage.getItem("access_token"),
        Count: 50,
        // NOTE: When adding lazy-loading, the before date should initially be whatever
        // the current time is. Subsequent loads should be the `DateCreated` within the
        // oldest message returned from `getmessages`.
        Before: Date.now(),
      })
      .then((res) => {
        if (res.data.Error !== null) {
          throw res.data.Error;
        }

        // NOTE: Messages are returned in reverse order, so we must reverse
        // the messages before we append them
        let newMessages = [];
        res.data.Messages.slice()
          .reverse()
          .forEach((msg) => {
            newMessages.push(msg);
          });

        setMessages(newMessages);
      })
      .catch((error) => {
        console.error(error.toString());
      });
  };

  const newChannel = async (event) => {
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

  return (
    <div className="main_div">
      <ul id="ChatList">
        {messages.map((message, i) => {
          return <li key={i}>{message.Content}</li>;
        })}
      </ul>
      <div>
        <input type="text" onChange={handleMsgChange} ref={msgRef}></input>
        <button type="button" onClick={sendMessage}>
          Send
        </button>
      </div>
      </div>
  );
};

export default ChatExamples;
