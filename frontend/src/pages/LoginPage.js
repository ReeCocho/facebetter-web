import React, { useState } from "react";

import PageTitle from "../components/PageTitle";
import Login from "../components/Login";
import "../App.css";
import Modal from "../components/Modal";



const LoginPage = () => {
  const [showModal, setShowModal] = useState(false);

  function registerPop() {
    setShowModal(true);
    console.log("onTodoDelete()");
  }
  

  return (
      <div class="background" >
        <PageTitle />
        <Login registerPop={registerPop}/>
        {showModal && <Modal/>}
        {/* <Modal/> */}
      </div>
  );
};

export default LoginPage;
