import React, { useState } from "react";
import "../components/login.css";

function Login({registerPop}) {
  var bp = require("./Path.js");

  var loginName;
  var loginPassword;

  const [message, setMessage] = useState("");

  const doLogin = async (event) => {
    event.preventDefault();

    var obj = { Login: loginName.value, Password: loginPassword.value };
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
    }
  };




  return (
    <div id="loginDiv">
        <form class="login__form">
          <div className="login__container">
          <input
            class="inputBox"
            type="text"
            id="loginName"
            placeholder="  Username"
            ref={(c) => (loginName = c)}
            />
          <input
            class="inputBox"
            type="password"
            id="loginPassword"
            placeholder="  Password"
            ref={(c) => (loginPassword = c)}
            />
          <input
            type="submit"
            id="loginButton"
            class="buttons inputBox"
            value="Log In"
            onClick={doLogin}
            />
            </div>
            <span id="loginResult">{message}</span>
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
        </form>
    </div>
  );
}

export default Login;
