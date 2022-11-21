import React from 'react';
import '../components/Profile.css';
import axios from "axios";
import People from '../components/People_Following';

function Following() {

  let ud = JSON.parse(localStorage.getItem('user_data'));
  var bp = require('../components/Path.js');

  axios
      .post(bp.buildPath("api/customrequest") , {
        _id: ud.userId,
        Request: "Following"
      })
      .then((res) => {
        //console.log(res.data.Result);
        localStorage.setItem("following", JSON.stringify(res.data.Result));
      })
      .catch((error) => {
        console.error(error);
      });

  let following_info = JSON.parse(localStorage.getItem("following"));
  //console.log(following_info)
  let times = following_info.length
  
  let arr = []

  for (let i = 0; i < times; i++) {
    axios
    .post(bp.buildPath("api/retrieveprofile") , {
      _id: following_info[i],
    })
    .then((res) => {
      localStorage.setItem(`followingProfile${i}`, JSON.stringify(res.data));
      //console.log(res.data)
    })
    .catch((error) => {
      console.error(error);
    });
    
    arr.push(JSON.parse(localStorage.getItem(`followingProfile${i}`)))
  }






  return (
    <div className='main_div'>      
      <div className='header'>
        <h2>Following</h2>

    </div>
        {arr.map(person => (
          <People first={person.FirstName}
          last={person.LastName} 
          school={person.School}
          work={person.Work} 
          id={person.Id}/>
        ))}
  </div>
  )
}


export default Following