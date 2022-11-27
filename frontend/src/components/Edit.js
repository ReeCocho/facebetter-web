import React, { useEffect, useState, useRef } from 'react';
import './Profile.css';
import axios from "axios";
import UploadFile from "./UploadFile";

function Edit() {
  var editFirstName;
  var editLastName;
  var editSchool;
  var editWork;
  var editBio;
  var editLogin;
  
  // incoming: {_id: "6344e4ea7c568d2a25ed0f6f", FirstName: "NewFirst", LastName: "NewLast", ...}

  const [ profile, setProfile ] = useState([]);
  let ud = JSON.parse(localStorage.getItem('user_data'));
  var bp = require('../components/Path.js');
  const ref = useRef()

  useEffect(() => {

    // This is turning an async call into a sync one
    (async () => {

      const profile = await axios.post(bp.buildPath("api/retrieveprofile"), {
        _id: ud.userId,
      });


      // Set the `profile` variable to be our new array
      setProfile(profile.data);
      localStorage.setItem("profile_pic_link", profile.data.ProfilePicture);
    })();
  }, []);

  const doEdit = async (event) => {
    console.log(ud.userId);
    event.preventDefault();

    // Retain previous values if nothing is entered
    if (editFirstName.value == "") {
      editFirstName.value = profile.FirstName;
    }
    if (editLastName.value == "") {
      editLastName.value = profile.LastName;
    }
    if (editSchool.value == "") {
      editSchool.value = profile.School;
    }
    if (editWork.value == "") {
      editWork.value = profile.Work;
    }
    if (editBio.value == "") {
      editBio.value = profile.Bio;
    }
    if (editLogin.value == "") {
      editLogin.value = profile.Login;
    }

    axios
      .post(bp.buildPath("api/editprofile") , {
        _id: ud.userId,
        FirstName: editFirstName.value,
        LastName: editLastName.value,
        School: editSchool.value,
        Work: editWork.value,
        Bio: editBio.value,
        Login: editLogin.value,
        JwtToken: localStorage.getItem("access_token")
      })
      .then((res) => {
        console.log(res.data);
        window.location.href = "Profile";
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div className="main_div">
      <div className="header">
        <h2>Edit</h2>
          <input
            type="submit"
            id="editButton"
            value="Submit"
            onClick={doEdit}
          />
      </div>
      <div className="profile_body">
        <div className="center">
          <div className="brightness">
            <UploadFile
              onComplete={(result) => {
                let ud = JSON.parse(localStorage.getItem("user_data"));
                let userId = ud.userId;
                axios
                  .post(bp.buildPath("api/updateprofilepic"), {
                    _id: userId,
                    FileUrl: result.fileUrl,
                  })
                  .then((res) => {
                    localStorage.setItem("profile_info", JSON.stringify(res.data));
                    console.log(res);
                    window.location.href = "Edit";
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }}
            />
          </div>
        </div>
        <h2>Handle</h2>
        <input 
          type="text"
          id="editLogin"
          placeholder={profile.Login}
          ref={(c) => (editLogin = c)}
        />
        <h2>First Name</h2>
        <input 
          type="text"
          id="editFirstName"
          placeholder={profile.FirstName}
          ref={(c) => (editFirstName = c)}
        />
        <h2>Last Name</h2>
        <input 
          type="text"
          id="editLastName"
          placeholder={profile.LastName}
          ref={(c) => (editLastName = c)}
        /> 
        <h2>Work</h2>
        <input 
          type="text"
          id="editWork"
          placeholder={profile.Work}
          ref={(c) => (editWork = c)}
        /> 
        <h2>School</h2>
        <input 
          type="text"
          id="editSchool"
          placeholder={profile.School}
          ref={(c) => (editSchool = c)}
        />   
        <h2>Bio</h2>
        <input 
          type="text"
          id="editBio"
          placeholder={profile.Bio}
          ref={(c) => (editBio = c)}
        /> 
      </div>
    </div>
    );
  }
  export default Edit;