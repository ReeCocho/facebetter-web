import React, { Component } from 'react';

const { useState, useRef } = React;
const ws = new WebSocket('ws://localhost:8000');

function Chat() {
    const ref = useRef(null);
    const [ messages, setMessages ] = useState([]);
    const [ input, setInput ] = useState('');

    ws.addEventListener('message', function message(event) {
        const serverData = JSON.parse(event.data);
        setMessages([...messages, serverData.message.message]);
    });

    function handleChange(e) {
        setInput(e.target.value);
    }

    const sendMessage = async event => {
        event.preventDefault();

        if (input.length == 0) {
            return;
        }

        setInput('');
        ref.current.focus();

        // Turn message into JSON
        var m = { message: input };
        var js = JSON.stringify(m);

        // Send message to server using API
        try {
            const response = await fetch(
                'http://localhost:5000/api/sendMessage',
                {
                    method: 'POST',
                    body: js,
                    headers: {'Content-Type': 'application/json'}
                }
            );

            var res = JSON.parse(await response.text());

            if (res.id <= 0) {
                messages.push("Could not send message.");
            }
        } catch(e) {
            alert(e.toString());
            return;
        }
    };

    return(
        <div>
            <ul id="ChatList">
                {
                    messages.map(message => {
                        return <li>{message}</li>
                    })
                }
            </ul>
            <input type="text" onChange={handleChange} ref={ref}></input>
            <button type="button" onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;