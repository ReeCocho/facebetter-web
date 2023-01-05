import React from 'react'

function ChatDM({title, id, message, time}) {
  return (
    <div>
        <h1>{title}&nbsp;</h1>
        <h2>{id}</h2>
    </div>
  )
}

export default ChatDM