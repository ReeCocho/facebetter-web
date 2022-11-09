import React from 'react';
import { buildPathWs } from '../components/Path';

const ws = new WebSocket(buildPathWs());

const ChatExamples = () =>
{
    ws.addEventListener('message', function message(event) {
        console.log(JSON.parse(event.data));
    });

    return(
        <div>
        </div>
    );
}

export default ChatExamples;
