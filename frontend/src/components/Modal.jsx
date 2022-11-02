import "./Modal.css";
import axios from "axios";
import jwt_decode from "jwt-decode";
import React, { useState } from "react";




function Modal({ unRegisterPop }) {

  var registerName;
  var registerPassword;
  var registerFirst;
  var registerLast;
  var registerSchool;
  var registerWork;


  const [message, setMessage] = useState("");




  const doRegister = async (event) => {
    event.preventDefault();
    var obj = { Login: registerName.value, Password: registerPassword.value, FirstName: registerFirst.value, LastName: registerLast.value, School: null, Work: null};
    var js = JSON.stringify(obj);

    // Login: "string",
    // Password: "string",
    // FirstName: "string",
    // LastName: "string",

    axios
      .post("https://facebetter.herokuapp.com/api/register", {
        Login: registerName.value,
        Password: registerPassword.value,
        FirstName: registerFirst.value, 
        LastName: registerLast.value,
        School: "",
        Work: ""
      })
      .then((res) => {
        console.log(res);
        const token = res.data.JwtToken.accessToken;
        var decode1 = jwt_decode(token);
        console.log(decode1);
      })
      .catch((error) => {
        error = message
        console.error(error);
      });
    }



  return (
    <>
      <div className="modal">
        <div className="modal__container">
        <p className="modal__title">Register</p>
        <form class="login__formR">
          <input
            class="inputBoxR loginNameR"
            type="email"
            placeholder="  Email"
            required
            // ref={(c) => (registerLogin = c)}
          />
          <input
            class="inputBoxR loginNameR"
            type="text"
            placeholder="  Username"
            required
            ref={(c) => (registerName = c)}
          />
          <input
            class="inputBoxR loginPasswordR"
            type="password"
            placeholder="  Password"
            required
            ref={(c) => (registerPassword = c)}
          />
          <input
            class="inputBoxR loginPasswordR"
            type="password"
            placeholder="  Confirm Password"
            required
            ref={(c) => (registerPassword = c)}
          />
          <div className="name">
            <input
              class="inputBoxR loginPasswordR"
              type="Text"
              placeholder="  First Name"
              required
              ref={(c) => (registerFirst = c)}
            />
            <input
              class="inputBoxR loginPasswordR"
              type="Text"
              placeholder="  Last Name"
              ref={(c) => (registerLast = c)}
            />
          </div>
          <span id="registerResult">{message}</span>
          <button
            type="submit"
            id="registerButton"
            class="buttons inputBoxR"
            value="Create New Account"
            onClick={doRegister}
          >
            Create New Account
          </button>
        </form>
        </div>
      </div>
      <div className="backdrop" onClick={unRegisterPop} />
    </>
  );
}

export default Modal;
