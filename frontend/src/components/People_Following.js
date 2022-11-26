import React from 'react'
import "./People.css"
import axios from "axios"




function People({ first, last, work, school, id, picture}) {

  
  //console.log(localStorage.getItem("JwtToken"));
  
  /*function doUnfollow(){
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
  }*/

  const doUnfollow = async () => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('./Path.js');
    
    try {
      const res = await axios.post(bp.buildPath("api/unfollow"), {
        _id: ud.userId,
        ToUnfollow: id,
        JwtToken: localStorage.getItem("access_token")
      })
      console.log(res.data);
      console.log(first);
    } catch (error){
      console.log(error);
    }
  }

  const viewProfile = async () => {
    console.log(id);
    console.log(first);
    localStorage.setItem("search_profile", id);    

  }

  return (
    <div className='container'>
        <img src={picture} alt="" className="search_picture"></img>
        <a href='../components/User'
          onClick={viewProfile}>
          <div>
            <h1>{first}&nbsp;{last}</h1>
          </div>    
        </a>

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