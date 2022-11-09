import React from 'react';
import { buildPathWs } from '../components/Path';

const ws = new WebSocket(buildPathWs());

const ChatExamples = () =>
{
    ws.addEventListener('message', function message(event) {
        
    });

    return(
        <div>
        </div>
    );
}

export default ChatExamples;
