import React, { useState } from "react";

import PageTitle from "../components/PageTitle";
import RecoverPW from "../components/RecoverPW";
import "../App.css";




const EnterEmailPage = () => {

  return (
      <div className="background" >
        <PageTitle />
        <RecoverPW />
      </div>
  );
};

export default EnterEmailPage;