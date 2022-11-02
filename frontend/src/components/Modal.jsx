import "./Modal.css";
import axios from "axios";
import jwt_decode from "jwt-decode";
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
    event.preventDefault();
    let password1 = registerPassword.value;
    let password2 = registerPasswordConfirmation.value;

    if(password1 === password2){
      var hash = md5(password1)
      
    var obj = { Login: registerName.value, Password: hash, FirstName: registerFirst.value, LastName: registerLast.value, School: null, Work: null};
    var js = JSON.stringify(obj);

    // Login: "string",
    // Password: "string",
    // FirstName: "string",
    // LastName: "string",

    axios
      .post("https://facebetter.herokuapp.com/api/register", {
        Login: registerName.value,
        Password: hash,
        FirstName: registerFirst.value, 
        LastName: registerLast.value,
        School: "",
        Work: ""
      })
      .then((res) => {
        yesError("")
        console.log(res);
        const token = res.data.JwtToken.accessToken;
        var decode1 = jwt_decode(token);
        console.log(decode1);
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
            required
            ref={(c) => (registerName = c)}
          />
          <input
            className="inputBoxR loginPasswordR password1"
            type="password"
            placeholder="  Password"
            required
            ref={(c) => (registerPassword = c)}
          />
          <input
            className="inputBoxR loginPasswordR password2"
            type="password"
            placeholder="  Confirm Password"
            required
            ref={(c) => (registerPasswordConfirmation = c)}
          />
          <div className="name">
            <input
              className="inputBoxR loginPasswordR"
              type="Text"
              placeholder="  First Name"
              required
              ref={(c) => (registerFirst = c)}
            />
            <input
              className="inputBoxR loginPasswordR"
              type="Text"
              placeholder="  Last Name"
              ref={(c) => (registerLast = c)}
            />
          </div>
          <span id="registerResult">{message} </span>
          <button
            type="submit"
            id="registerButton"
            className="buttons inputBoxR"
            value="Create New Account"
            onClick={doRegister}
            onSubmit={unRegisterPop}
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
