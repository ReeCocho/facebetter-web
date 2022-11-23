import React from 'react';
import jwt_decode from "jwt-decode";
import axios from "axios";

function ConfirmRegistration()
{
  var bp = require('./Path.js');
  
  const ConfirmRegistration = event => 
  {
    let urlElements = window.location.href.split('/');
    let token = urlElements[urlElements.length - 1];

    axios
      .get(bp.buildPath("api/verifyemail"), {
        JwtToken: token
      });
      window.location.href = '/';
  };    

  return(
   <div id="confirmDiv">
   <span id="message">Please Please Confirm of Registration?</span><br />
   <button type="button" id="confirmationButton" 
     onClick={ConfirmRegistration}> Confirm Registration </button>
   </div>
  );

};


export default ConfirmRegistration;