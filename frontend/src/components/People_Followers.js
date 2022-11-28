
import React, { useEffect, useState } from 'react';
import "./People.css"
import axios from "axios"

function People({ first, last, work, school, picture, id, login}) {
  const [ profileSelf, setProfileSelf ] = useState([]);
  const [ isFollowing, setIsFollowing ] = useState([]);
  let followingList;
  
  useEffect(() => {
    var bp = require('../components/Path.js');

    (async () => {
      let ud = JSON.parse(localStorage.getItem('user_data'));
      const profileSelf = await axios.post(bp.buildPath('api/retrieveprofile'), {
          _id: ud.userId,
      });

      // Set the `profile` variable to be our new array
      setProfileSelf(profileSelf.data);
      followingList = profileSelf.data.Following;
      setIsFollowing(followingList.includes(id))
    })();
  }, []);

  async function handleChatClick(e) {
    e.stopPropagation();
    e.preventDefault();
    var bp = require("./Path.js");
    try {
      const res = await axios.post(bp.buildPath("api/createdm"), {
        OtherUserId: id,
        JwtToken: localStorage.getItem("access_token"),
      });
      console.log(res.data);
      console.log(res.data.Channel);
      localStorage.setItem("the_input", res.data.Channel);
      localStorage.setItem("otherUserID", id);
      document.dispatchEvent(
        new CustomEvent("Rerender", { detail: { id: res.data.Channel } })
      );
    } catch (error) {
      console.log(error);
    }
  }


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
    window.location.href = "Followers";
  }

  const doUnfollow = async () => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('./Path.js');
    try {
      const res = await axios.post(bp.buildPath("api/unfollow"), {
        _id: ud.userId,
        ToUnfollow: id,
        JwtToken: localStorage.getItem("access_token")
      })
    } catch (error){
      console.log(error);
    }
    window.location.href = "Followers";
  }

  function handleFollow(e) {
    e.stopPropagation();
    e.preventDefault();

    doFollow();
    
  }

  function handleUnfollow(e) {
    e.stopPropagation();
    e.preventDefault();

    doUnfollow();
    
  }

  // function handleChatClick(e) {
  //   e.stopPropagation();
  //   e.preventDefault();  
  // }


  return (
    <a href="../components/User" onClick={viewProfile}>
      <div className='container'>
          <img src={picture} alt="" className="search_picture"></img>
          <h1>{first}&nbsp;{last}</h1>
          <div>
            <button className="btn" onClick={handleChatClick}>Chat</button>
            {isFollowing
              ? <input className='btn' type='submit' value="Unfollow" onClick={handleUnfollow} />
              : <input className='btn' type='submit' value="Follow" onClick={handleFollow} /> 
            } 
          </div> 
      </div>
    </a>
  )
}

export default People;
