import React from 'react';
import '../components/Profile.css';
import axios from "axios";
import People from '../components/People_Followers';

function Followers() {

  let ud = JSON.parse(localStorage.getItem('user_data'));
  var bp = require('../components/Path.js');

  axios
      .post(bp.buildPath("api/customrequest") , {
        _id: ud.userId,
        Request: "Followers"
      })
      .then((res) => {
        localStorage.setItem("followers", JSON.stringify(res.data.Result));
      })
      .catch((error) => {
        console.error(error);
      });

  let followers_info = JSON.parse(localStorage.getItem("followers"));
  console.log(followers_info);
  let times = followers_info.length;
  
  let arr = []

  for (let i = 0; i < times; i++) {
    axios
    .post(bp.buildPath("api/retrieveprofile") , {
      _id: followers_info[i],
    })
    .then((res) => {
      localStorage.setItem(`followingProfile${i}`, JSON.stringify(res.data));
      // console.log(res.data)
    })
    .catch((error) => {
      console.error(error);
    });
    
    arr.push(JSON.parse(localStorage.getItem(`followingProfile${i}`)))
  }

  return (
    <div className='main_div'>      
      <div className='header'>
        <h2>Followers</h2>

    </div>
        {arr.map(person => (
          <People first={person.FirstName}
          last={person.LastName} 
          school={person.School}
          work={person.Work} />
        ))}
  </div>
  )
}


export default Followers;