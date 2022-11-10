import React from 'react';
import { buildPathWs } from '../components/Path';

class ChatListener
{
    /**
     * Constructs a new chat listener object.
     * 
     * @param jwt The non-decoded JWT identifying the user which is received on login.
     */
    constructor(jwt) 
    {
        this.ws = new WebSocket(buildPathWs());
        this.ws.chat = {};
        this.ws.chat.callbacks = [];

        this.ws.addEventListener('open', (event) => 
        {
            const identify = 
            {
                JwtToken: jwt
            };
            this.ws.send(JSON.stringify(identify));
        });

        this.ws.addEventListener('message', (event) => 
        {
            try
            {
                let json = JSON.parse(event.data);
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
     * Adds a new listener callback function to receive chat messages. 
     * 
     * @param callback A function that receives a chat message object. The message object received
     * is of the following form:
     * 
     * {
     *  Sender: "A string containing the username of the person who sent the message.",
     *  SenderId: "A string with the user ID of the person sending the message.",
     *  ChannelId: "A string containing the ID of the channel the message was sent in."
     *  Message: "A string containing the contents of the message."
     * }
     * 
     * Example Usage:
     * ```
     * chatListener.addListener(function(msg) {
     *  console.log(msg.Sender + " sent a message in the " + msg.ChannelId + "channel!");
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

const chat = new ChatListener("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzQ0ZTRlYTdjNTY4ZDJhMjVlZDBmNmYiLCJmaXJzdE5hbWUiOiJEZW5uaXMiLCJsYXN0TmFtZSI6IkNlcGVybyIsImlhdCI6MTY2ODA0OTgwMn0.jSy9Q2H7_v0HW5y3Tagg1kY6D6DQxWyxH9BF5mDt87Y");

const ChatExamples = () =>
{
    chat.addListener(function (data) {
        console.log(data);
    });

    return(
        <div>
        </div>
    );
}

export default ChatExamples;
