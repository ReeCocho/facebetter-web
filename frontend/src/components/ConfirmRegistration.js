import React, { useState } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import "./ConfirmRegistration.css";

function ConfirmRegistration() {
  var bp = require("./Path.js");

  const [message, setMessage] = useState("");

  function yesError(error) {
    setMessage(error.toString());
  }

  function noError() {
    setMessage("");
  }

  const ConfirmRegistration = async (event) => {
    let urlElements = window.location.href.split("/");
    let token = urlElements[urlElements.length - 1];

    axios
      .post(bp.buildPath("api/verifyemail"), {
        JwtToken: token,
      })
      .then((res) => {
        if (res.data.Error !== null) {
          yesError(res.data.Error);
        } else {
          noError();
          console.log(res);
          window.location.href = "/";
        }
      })
      .catch((error) => {
        console.error(error);
        yesError(error);
      });
  };

  return (
    <div id="confirmDiv">
      <br />
      <span id="message">Please Please Confirm of Registration?</span>
      <br />
      <span id="loginResult">{message}</span>
      <br />
      <button
        type="button"
        id="confirmationButton"
        onClick={ConfirmRegistration}
      >
        {" "}
        Confirm Registration{" "}
      </button>
    </div>
  );
}

export default ConfirmRegistration;
