import React from "react";
import './Profile.css';
import axios from "axios";

function Edit() {
  

    return (
    <div className="profile_div">
      <div className="profile_body">
        <h2>First Name</h2>
        <input
            type="text"
            value="new name here"
        />
        <h2>Last Name</h2>
     
      </div>
    </div>
    );
  }
  export default Edit;