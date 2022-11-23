import React, { useEffect, useState } from 'react';
import './Profile.css';
import axios from "axios";


function Profile() {

  const [ profile, setProfile ] = useState([]);

  // This function gets called once on page load
  useEffect(() => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('../components/Path.js');

    // This is turning an async call into a sync one
    (async () => {

      const profile = await axios.post(bp.buildPath("api/retrieveprofile"), {
        _id: ud.userId,
      });


      // Set the `profile` variable to be our new array
      setProfile(profile.data);
    })();
  }, []);

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
        <a href="/components/Edit" id="link">
          <input
            type="submit"
            id="editButton"
            value="Edit"
          />
        </a>
      </div>
      <div className="profile_body">
        <img src={profile.ProfilePicture} alt="" id="profile_picture"></img>
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
  export default Profile;