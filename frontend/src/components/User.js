import React, { useEffect, useState } from 'react';
import './Profile.css';
import axios from "axios";

function User() {

  const [ profile, setProfile ] = useState([]);

  // This function gets called once on page load
  useEffect(() => {
    var bp = require('../components/Path.js');

    // This is turning an async call into a sync one
    (async () => {

      const profile = await axios.post(bp.buildPath('api/retrieveprofile'), {
        _id: localStorage.getItem('search_profile'),
      });


      // Set the `profile` variable to be our new array
      setProfile(profile.data);
    })();
  }, []);

  const doFollow = async () => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('./Path.js');
    console.log(localStorage.getItem("login_profile"));
    try {
      const res = await axios.post(bp.buildPath("api/follow"), {
        _id: ud.userId,
        ToFollow: localStorage.getItem("login_profile"),
        JwtToken: localStorage.getItem("access_token")
      })
      console.log(res.data);
    } catch (error){
      console.log(error);
    }
  }


  /*let ud = JSON.parse(localStorage.getItem('user_data'));
  var bp = require('./Path.js');

  axios
      .post(bp.buildPath("api/retrieveprofile") , {
        _id: ud.userId,
      })
      .then((res) => {
        localStorage.setItem("profile_info", JSON.stringify(res.data));
        console.log(res.data);
      })
      .catch((error) => {
        console.error(error);
      });

  let user_info = JSON.parse(localStorage.getItem("profile_info"));*/

    return (
    <div className="main_div">
      <div className='header'>
        <h2>Profile</h2>
        <a id="link">
          <input
            type="submit"
            id="editButton"
            value="Follow"
            onClick={doFollow}
          />
        </a>
      </div>
      <div className="profile_body">
        <div className="center">
          <img src={profile.ProfilePicture} alt="" className="profile_picture"></img>
        </div>
        <h2>First Name</h2>
        <h3>{profile.FirstName}</h3>
        <h2>Last Name</h2>
        <h3>{profile.LastName}</h3>  
        <h2>Work</h2>
        <h3>{profile.Work}</h3>  
        <h2>School</h2>
        <h3>{profile.School}</h3>  
      </div>
    </div>
    );
  }
  export default User;