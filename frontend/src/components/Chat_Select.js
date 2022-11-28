import React from "react";
import "./People.css";
import axios from "axios";

function Chat({ title, picture , id}) {

  function openChat() {
    console.log(id);
  }


  return (

    <a onClick={openChat}>
      <div className='container'>
          <img src={picture} alt="" className="search_picture" ></img>
          <h1>{title}</h1>
          <div>
            <button className="btn">Chat</button>
          </div> 
      </div>
    </a>

  )
}

export default Chat;
