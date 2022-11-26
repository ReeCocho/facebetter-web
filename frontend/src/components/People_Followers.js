import React from 'react'
import "./People.css"
import axios from "axios"

function People({ first, last, work, school, picture, id, login}) {
  const viewProfile = async () => {
    console.log(id);
    console.log(first);
    localStorage.setItem("search_profile", id);    

  }
  
  const doFollow = async () => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('./Path.js');
    console.log(login);

    try {
      const res = await axios.post(bp.buildPath("api/follow"), {
        _id: ud.userId,
        ToFollow: login,
        JwtToken: localStorage.getItem("access_token")
      })
      console.log(res.data);
    } catch (error){
      console.log(error);
    }
  }

  function handleFollow(e) {
    e.stopPropagation();
    e.preventDefault();

    doFollow();
    
  }

  function handleChatClick(e) {
    e.stopPropagation();
    e.preventDefault();
    
  }
  return (
    <a href="../components/User" onClick={viewProfile}>
      <div className='container'>
          <img src={picture} alt="" className="search_picture"></img>
          <h1>{first}&nbsp;{last}</h1>
          <button className="btn" onClick={handleChatClick}>Chat</button>
          <input
            className='btn'
            type='submit'
            value="Follow"
            onClick={handleFollow}
            >
          </input>  
      </div>
    </a>
  )
}

export default People