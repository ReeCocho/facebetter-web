import React, { useState } from "react";
import "../components/login.css";
import axios from "axios";
import jwt_decode from "jwt-decode";

function Login({ registerPop }) {
  var bp = require("./Path.js");

  var loginName;
  var loginPassword;

  const [message, setMessage] = useState("");

  function yesError() {
    setMessage("Username/password are incorrect");
  }

  function noError() {
    setMessage("");
  }

  const doLogin = async (event) => {
    event.preventDefault();
    var obj = { Login: loginName.value, Password: loginPassword.value };
    var js = JSON.stringify(obj);

    axios
      .post("https://facebetter.herokuapp.com/api/login", {
        Login: loginName.value,
        Password: loginPassword.value,
      })
      .then((res) => {
        noError();
        console.log(res);
        const token = res.data.JwtToken.accessToken;
        var decode1 = jwt_decode(token);
        console.log(decode1);
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
        <form class="login__form">
          <div className="login__container">
            <input
              class="inputBox"
              type="text"
              id="loginName"
              placeholder="  Username"
              ref={(c) => (loginName = c)}
              required
            />
            <input
              class="inputBox"
              type="password"
              id="loginPassword"
              placeholder="  Password"
              ref={(c) => (loginPassword = c)}
              required
            />
            <input
              type="submit"
              id="loginButton"
              class="buttons inputBox"
              value="Log In"
              onClick={doLogin}
            />
          <span id="loginResult">{message}</span>
          </div>
        </form>
          <div class="line"></div>
          <button
            type="submit"
            id="registerButton"
            class="buttons inputBox"
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
