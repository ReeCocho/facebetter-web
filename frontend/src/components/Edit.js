import React from "react";
import './Profile.css';
import axios from "axios";

function Edit() {
  var editFirstName;
  var editLastName;
  var editSchool;
  var editWork
  
  let ud = JSON.parse(localStorage.getItem("user_data"));
  let user_info = JSON.parse(localStorage.getItem("profile_info"));
  var bp = require('./Path.js');
  // incoming: {_id: "6344e4ea7c568d2a25ed0f6f", FirstName: "NewFirst", LastName: "NewLast", ...}



  const doEdit = async (event) => {
    console.log(ud.userId);
    event.preventDefault();
    axios
      .post(bp.buildPath("api/editprofile") , {
        _id: ud.userId,
        FirstName: editFirstName.value,
        LastName: editLastName.value,
        School: editSchool.value,
        Work: editWork.value,
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
        <h2>First Name</h2>
        <input 
          type="text"
          id="editFirstName"
          placeholder={user_info.FirstName}
          ref={(c) => (editFirstName = c)}
        />
        <h2>Last Name</h2>
        <input 
          type="text"
          id="editLastName"
          placeholder={user_info.LastName}
          ref={(c) => (editLastName = c)}
        /> 
        <h2>Work</h2>
        <input 
          type="text"
          id="editWork"
          placeholder={user_info.Work}
          ref={(c) => (editWork = c)}
        /> 
        <h2>School</h2>
        <input 
          type="text"
          id="editSchool"
          placeholder={user_info.School}
          ref={(c) => (editSchool = c)}
        />   
      </div>
    </div>
    );
  }
  export default Edit;