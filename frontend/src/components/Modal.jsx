import "./Modal.css";
import axios from "axios";
// import jwt_decode from "jwt-decode";
import React, { useState } from "react";
import md5 from './md5'




function Modal({ unRegisterPop }) {

  var registerName;
  var registerPassword;
  var registerFirst;
  var registerLast;
  var registerPasswordConfirmation
  var registerSchool;
  var registerWork;



  const [message, setMessage] = useState("");


  function yesError(error) {
    setMessage(error);
  }



  const doRegister = async (event) => {
    var bp = require('./Path.js');

    event.preventDefault();
    let password1 = registerPassword.value;
    let password2 = registerPasswordConfirmation.value;

    if(password1 === password2 && password1 !== ""){
      var hash = md5(password1)
    var obj = { Login: registerName.value, Password: hash, FirstName: registerFirst.value, LastName: registerLast.value, School: null, Work: null};
    var js = JSON.stringify(obj);

    // Login: "string",
    // Password: "string",
    // FirstName: "string",
    // LastName: "string",

    axios
      .post(bp.buildPath("api/register"), {
        Login: registerName.value,
        Password: hash,
        FirstName: registerFirst.value, 
        LastName: registerLast.value,
        School: "",
        Work: ""
      })
      .then((res) => {
        if(res.data.Error)
        {
          yesError(res.data.Error);
        }
        else{
          window.location.href = "./";
          yesError("")
        }
      })
      .catch((e) => {
        console.log(e)
        yesError("Fill all of the fields")
      });
    }
    else
    {
      yesError("The passwords do not match")
    }
  }



  return (
    <>
      <div className="modal">
        <div className="modal__container">
        <p className="modal__title">Register</p>
        <form className="login__formR" onSubmit={doRegister}>
          <input
            className="inputBoxR loginNameR"
            type="email"
            placeholder="  Email"
            required
            // ref={(c) => (registerLogin = c)}
          />
          <input
            className="inputBoxR loginNameR"
            type="text"
            placeholder="  Username"
            ref={(c) => (registerName = c)}
            required
          />
          <input
            className="inputBoxR loginPasswordR password1"
            type="password"
            placeholder="  Password"
            ref={(c) => (registerPassword = c)}
            required
          />
          <input
            className="inputBoxR loginPasswordR password2"
            type="password"
            placeholder="  Confirm Password"
            ref={(c) => (registerPasswordConfirmation = c)}
            required
          />
          <div className="name">
            <input
              className="inputBoxR loginPasswordR"
              type="Text"
              placeholder="  First Name"
              ref={(c) => (registerFirst = c)}
              required
            />
            <input
              className="inputBoxR loginPasswordR"
              type="Text"
              placeholder="  Last Name"
              ref={(c) => (registerLast = c)}
              required
            />
          </div>
          <span id="registerResult">{message} </span>
          <button
            type="submit"
            id="registerButton"
            className="buttons inputBoxR"
            value="Create New Account"
            onClick={doRegister}
          >
            Create New Account
          </button >
        </form>
        </div>
      </div>
      <div className="backdrop" onClick={unRegisterPop} />
    </>
  );
}

export default Modal;
