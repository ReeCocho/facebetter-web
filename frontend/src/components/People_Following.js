import React from 'react'
import "./People.css"
import axios from "axios"

function People({ first, last, work, school, id}) {

  var bp = require('./Path.js');
  var results = JSON.parse(localStorage.getItem("search_result"));
  let ud = JSON.parse(localStorage.getItem('user_data'));
  
  //console.log(localStorage.getItem("JwtToken"));
  
  function doUnfollow(){
      axios
      .post(bp.buildPath("api/unfollow") , {
        _id: ud.userId,
        ToUnfollow: id,
        JwtToken: localStorage.getItem("access_token")
      })
      .then((res) => {
        console.log(res.data);
        console.log(first);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div className='container'>
        <div>
        <h1>{first}{last}</h1>
        <h2>{work}   {school}</h2>
        </div>

        <button className='btn'>Chat</button>
        <input
            className='btn'
            type='submit'
            value="Unfollow"
            onClick={doUnfollow}>
        </input>
    </div>

  )
}

export default People