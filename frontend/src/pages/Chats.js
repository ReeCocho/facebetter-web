import React, { useEffect, useState } from 'react';
import '../components/Profile.css';
import axios from "axios";
import Chat from "../components/ChatDM"

function Chats() {

  const [ channels, setChannels ] = useState([]);

  // This function gets called once on page load
  useEffect(() => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('../components/Path.js');

    let arrayOfObjects = []; 
    // This is turning an async call into a sync one
    (async () => {
      // Gets our channels list (list of user IDs)
      const res = await axios.post(bp.buildPath("api/customrequest"), {
        _id: ud.userId,
        Request: "Channels"
      });
      let channelIds = []
      
      channelIds = res.data.Result
      console.log(channelIds)
      let chats = []

      for(const id of res.data.Result){
        const chatNames = await axios.post(bp.buildPath("api/getchanneltitle"), {
          JwtToken: localStorage.getItem("access_token"),
          Channel: id
        });

        chats.push(chatNames.data);
      }

      console.log(chats)

      const combined = chats.map(function(c, i) {
        return {
            Title: c.Title,
            Id: channelIds[i]
        };
    });

      setChannels(combined);
    })();
  }, []);

  console.log(channels)


  return (
    <div className="main_div">
      <div className="header">
        <h2>Chats</h2>
      </div>
      {channels.map((chat, i) => {
          console.log(chat.Title + " " + i);
          return (
            <Chat title = {chat.Title}
            id = {chat.Id}
            key={i} />
          );
        })}
    </div>
  );
}

export default Chats;
