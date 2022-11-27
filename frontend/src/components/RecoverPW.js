import React, { useState } from "react";
import axios from "axios";
import md5 from './md5';
var bp = require('./Path.js');


function RecoverPW() {

  var newPW;
  var newPW2;

  var sha256 = require('js-sha256');

  const [message, setMessage] = useState("");

  function yesError(error) {
    setMessage(error.toString());
  }

  function noError() {
    setMessage("");
  }

  const resetPW = async (event) => {
    
    let pass1 = newPW.value;
    let pass2 = newPW2.value;
    let urlElements = window.location.href.split('/');
    let token = urlElements[urlElements.length - 1];
    event.preventDefault();

    if(pass1 === pass2 && pass1 !== "")
    {
        var hash = sha256(pass1);
        axios
        .post(bp.buildPath("api/resetpassword"), {
            NewPassword: hash,
            JwtToken: token,
        })
        .then((res) => {
          if(res.data.Error != null)
          {
            yesError(res.data.Error);
          }
          else
          {
            noError();
            console.log(res);
            window.location.href = '/';
          }
        })
        .catch((error) => {
          console.error(error);
          yesError(error);
        });

    }
    else
    {
        yesError("Passwords Do Not Match");
    }
    

  }; 


  return (
    <div id="passwordSquare">
        <form className="newpw__form">
          <div className="newpw__container">
            <input
              className="inputBox"
              type="text"
              id="newPW"
              placeholder="Please Enter New Password"
              ref={(c) => (newPW = c)}
              required
            />
            <input
              className="inputBox"
              type="text"
              id="newPW2"
              placeholder="Please Enter New Password Again"
              ref={(c) => (newPW2 = c)}
              required
            />
            <input
              button type="button"
              id="resetButton"
              className="buttons inputBox"
              value="Reset Password"
              onClick={resetPW}
            />
          <span id="pwResetResult">{message}</span>
          </div>
        </form>
    </div>
  );
}

export default RecoverPW;
