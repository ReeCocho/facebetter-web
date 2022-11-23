import React, { useState } from "react";
import "../components/login.css";
import axios from "axios";
import jwt_decode from "jwt-decode";
import md5 from './md5'

function Login({ registerPop }) {
  var bp = require('./Path.js');

  var loginName;
  var loginPassword;

  const [message, setMessage] = useState("");

  function yesError() {
    setMessage("Username/password are incorrect");
  }

  function noError() {
    setMessage("");
  }

  const switchToEmailPage = async (event) => {
    window.location.href = "./pages/EnterEmailPage";
  };

  const doLogin = async (event) => {
    let password1 = loginPassword.value
    var hash = md5(password1)
    event.preventDefault();
    var obj = { Login: loginName.value, Password: hash };
    var js = JSON.stringify(obj);

    axios
      .post(bp.buildPath("api/login") , {
        Login: loginName.value,
        Password: hash,
      })
      .then((res) => {
        noError();
        console.log(res);
        const token = res.data.JwtToken.accessToken;
        var decode1 = jwt_decode(token);
        console.log(decode1);
        localStorage.setItem("access_token", res.data.JwtToken.accessToken);
        localStorage.setItem("user_data", JSON.stringify(decode1));
        console.log(localStorage.getItem("user_data"));
        window.location.href = "./pages/ProfilePage";
      })
      .catch((error) => {
        console.error(error);
        yesError();
      });
      
    /*var obj = { Login: loginName.value, Password: loginPassword.value };
    var js = JSON.stringify(obj);

    try {
      const response = await fetch(bp.buildPath("api/login"), {
        method: "POST",
        body: js,
        headers: { "Content-Type": "application/json" },
      });

      var res = JSON.parse(await response.text());

      if (res.Error !== null) {
        setMessage("User/Password combination incorrect");
      } else {
        var user = {
          firstName: res.FirstName,
          lastName: res.LastName,
          id: res.Id,
        };
        localStorage.setItem("user_data", JSON.stringify(user));

        setMessage("");
        window.location.href = "/cards";
      }
    } catch (e) {
      alert(e.toString());
      return;
    }*/
  };

  return (
    <div id="loginDiv">
      <div className="loginSquare">
        <form className="login__form">
          <div className="login__container">
            <input
              className="inputBox"
              type="text"
              id="loginName"
              placeholder="  Username"
              ref={(c) => (loginName = c)}
              required
            />
            <input
              className="inputBox"
              type="password"
              id="loginPassword"
              placeholder="  Password"
              ref={(c) => (loginPassword = c)}
              required
            />
            <input
              type="submit"
              id="loginButton"
              className="buttons inputBox"
              value="Log In"
              onClick={doLogin}
            />
            <input
              type="submit"
              id="pwRecoveryButton"
              className="buttons inputBox"
              value="Forgot Password?"
              onClick={switchToEmailPage}
            />
          <span id="loginResult">{message}</span>
          </div>
        </form>
          <div className="line"></div>
          <button
            type="submit"
            id="registerButton"
            className="buttons inputBox"
            value="Create New Account"
            onClick={registerPop}
          >
            Create New Account
          </button>
      </div>
    </div>
  );
}

export default Login;
