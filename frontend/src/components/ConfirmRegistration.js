import React from 'react';
import jwt_decode from "jwt-decode";

function ConfirmRegistration()
{
    const ConfirmRegistration = event => 
    {
      let urlElements = window.location.href.split('/');
      let token = urlElements[urlElements.length - 1];
      let decoded = jwt_decode(token);
      let id = decoded.user;

      console.log("Confirmed " + id);
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