import React, { useState } from "react";
import "../components/login.css";
import axios from "axios";
import { sendEmail } from "../../../mailer";

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
    
    axios
      .post("https://facebetter.herokuapp.com/api/checkemail", {
        Email: emailAddress.value,
      })
      .then((res) => {
        noError();
        console.log(res);
        window.location.href = "./pages/LoginPage";
      })
      .catch((error) => {
        console.error(error);
        yesError(error);
      });
  };
  
  const switchToEmailPage = async (event) => {
    window.location.href = "./pages/EnterEmailPage";
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
              type="submit"
              id="sendButton"
              className="buttons inputBox"
              value="Recover Email"
              onClick={sendEmail}
            />
          <span id="loginResult">{message}</span>
          </div>
        </form>
    </div>
  );
}

export default Login;
