import React, { useEffect, useState } from 'react';
import './Profile.css';
import axios from "axios";

function User() {

  const [ profile, setProfile ] = useState([]);
  const [ profileSelf, setProfileSelf ] = useState([]);
  const [ isFollowing, setIsFollowing ] = useState([]);
  const [ numFollowers, setNumFollowers ] = useState([]);
  const [ numFollowing, setNumFollowing ] = useState([]);
  let followingList;

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
      localStorage.setItem("login_profile", profile.data.Login);
      setNumFollowers(profile.data.Followers.length);
      setNumFollowing(profile.data.Following.length);

    })();

    (async () => {
      let ud = JSON.parse(localStorage.getItem('user_data'));
      const profileSelf = await axios.post(bp.buildPath('api/retrieveprofile'), {
          _id: ud.userId,
      });

      // Set the `profile` variable to be our new array
      setProfileSelf(profileSelf.data);
      followingList = profileSelf.data.Following;
      setIsFollowing(followingList.includes(localStorage.getItem('search_profile')));
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
    window.location.href = "User";
  }


  const doUnfollow = async () => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('./Path.js');
    try {
      const res = await axios.post(bp.buildPath("api/unfollow"), {
        _id: ud.userId,
        ToUnfollow: localStorage.getItem('search_profile'),
        JwtToken: localStorage.getItem("access_token")
      })
    } catch (error){
      console.log(error);
    }
    window.location.href = "User";
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
        {/* {isFollowing()} */}
        <a id="link">
          {isFollowing
            ? <input type="submit" id="editButton" value="Unfollow" onClick={doUnfollow} />
            : <input type="submit" id="editButton" value="Follow" onClick={doFollow} />
          }
        </a>
      </div>
      <div className="profile_body">
        <div className="topProfile">
          <div className="center">
            <img
              src={profile.ProfilePicture}
              alt=""
              className="profile_picture"
            ></img>
          </div>
          <div className="separateLine"></div>
          <div className="follow_counts">
            <h2>
              {profile.FirstName}&nbsp;{profile.LastName}
            </h2>
            <h2 className="username">@{profile.Login}</h2>
            <div className="counts">
              <a href="/pages/Followers" className="anchorTag countsAnchor">
                <h2>Followers {numFollowers}&nbsp;</h2>
              </a>
              <div className="follow_counts">
                <a href="/pages/Following" className="anchorTag countsAnchor">
                  <h2>Following {numFollowing}</h2>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="separateLine"></div>
        <h2>Work</h2>
        <h3>{profile.Work}</h3>  
        <div className="separateLine"></div>

        <h2>School</h2>
        <h3>{profile.School}</h3> 
        <div className="separateLine"></div>

        <h2>Bio</h2>
        <h3>{profile.Bio}</h3> 
      </div>
    </div>
    );
  }
  export default User;