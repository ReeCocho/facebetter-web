import React, { useState } from "react";
import axios from "axios";
var bp = require('./Path.js');

function EmailCheck() {

  var emailAddress;

  const [message, setMessage] = useState("");

  function yesError(error) {
    setMessage(error.toString());
  }

  function noError() {
    setMessage("");
  }

  const checkEnteredEmail = async (event) => {
    event.preventDefault();
    axios
      .post(bp.buildPath("api/checkemail"), {
        Email: emailAddress.value,
      })
      .then((res) => {
        noError();
        console.log(res);
        window.location.href = '/';
      })
      .catch((error) => {
        console.error(error);
        yesError(error);
      });
  }; 


  return (
    <div id="emailSquare">
        <form className="emailcheck__form">
          <div className="emailcheck__container">
            <input
              className="inputBox"
              type="text"
              id="emailAddress"
              placeholder="Please Enter Recovery Email"
              ref={(c) => (emailAddress = c)}
              required
            />
            <input
              button type="button"
              id="sendButton"
              className="buttons inputBox"
              value="Recover Email"
              onClick={checkEnteredEmail}
            />
          <span id="emailResult">{message}</span>
          </div>
        </form>
    </div>
  );
}

export default EmailCheck;
