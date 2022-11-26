import React from 'react'
import "./People.css"
import axios from "axios";
import User from './User';

function People({ first, last, login, picture, id}) {


    const doFollow = async () => {
      let ud = JSON.parse(localStorage.getItem('user_data'));
      var bp = require('./Path.js');

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

    const viewProfile = async () => {

      
      let ud = JSON.parse(localStorage.getItem('user_data'));
      var bp = require('./Path.js');

      try {
        const res = await axios.post(bp.buildPath("/api/retrieveprofile"), {
          _id: id,
        })
        console.log(res.data);
        localStorage.setItem('search_profile', JSON.stringify(res.data)); 
      } catch (error){
        console.log(error);
      }
    }
    


    /*function doFollow(){
        axios
        .post(bp.buildPath("api/follow") , {
          _id: ud.userId,
          ToFollow: login,
          JwtToken: localStorage.getItem("access_token")
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }*/

  return (
    <div className='container'>
        <img src={picture} alt="" className="search_picture"></img>
        <a href="../User"
        onClick={viewProfile} ref={(c) => (loginPassword = c)}>
          <div>
            <h1>{first}&nbsp;{last}</h1>
          </div>    
        </a>
        
        <input
            className='btn'
            type='submit'
            value="Follow"
            onClick={doFollow}>
        </input>

    </div>

  )
}

export default People