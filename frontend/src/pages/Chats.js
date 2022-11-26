import React, { useEffect, useState } from 'react';
import '../components/Profile.css';
import axios from "axios";

function Chats() {

  const [ channels, setChannels ] = useState([]);

  // This function gets called once on page load
  useEffect(() => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('../components/Path.js');

    // This is turning an async call into a sync one
    (async () => {
      // Gets our channels list (list of user IDs)
      const res = await axios.post(bp.buildPath("api/customrequest"), {
        _id: ud.userId,
        Request: "Channels"
      });

      console.log(res)

      let chats = []

      for(const id of res.data.Result){
        const chatNames = await axios.post(bp.buildPath("api/getchanneltitle"), {
          JwtToken: localStorage.getItem("access_token"),
          Channel: id
        });

        chats.push(chatNames.data);
      }

      console.log(chats.Title);


      // // Populate a new array with the actual profiles of our channels
      // let chats = [];
      // for (const id of res.data.Result) {
      //   const profile = await axios.post(bp.buildPath("api/retrieveprofile"), {
      //     _id: id,
      //   });
      //   chats.push(profile.data);
      // }



      // // Set the `channels` variable to be our new array
      // setChannels(chats);
    })();
  }, []);

  return (
    <div className="main_div">
      <div className="header">
        <h2>Chats</h2>
      </div>
      {/* {followings.map((chat, i) => {
          console.log(chat.name + " " + i);
          return (
            <People 
            first={person.FirstName}
            last={person.LastName} 
            school={person.School}
            work={person.Work}
            id={person.Id} 
            picture={person.ProfilePicture}/>
          );
        })} */}
    </div>
  );
}

export default Chats;
