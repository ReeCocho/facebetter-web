import React from "react";
import './Profile.css';
import axios from "axios";


function Profile() {
  let ud = JSON.parse(localStorage.getItem('user_data'));
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

  let user_info = JSON.parse(localStorage.getItem("profile_info"));

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
        <img src={user_info.ProfilePicture} alt="" id="profile_picture"></img>
        <h2>First Name</h2>
        <h3>{user_info.FirstName}</h3>
        <h2>Last Name</h2>
        <h3>{user_info.LastName}</h3>  
        <h2>Work</h2>
        <h3>{user_info.Work}</h3>  
        <h2>School</h2>
        <h3>{user_info.School}</h3>  
      </div>
    </div>
    );
  }
  export default Profile;