import React from 'react'
import "./People.css"
import axios from "axios";

function People({ first, last, login, picture}) {

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
        <img src={picture} alt="" id="search_picture"></img>
        <div>
          <h1>{first}&nbsp;</h1>
          <h1>{last}</h1>
        </div>
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