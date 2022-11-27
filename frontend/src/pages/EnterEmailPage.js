import React, { useState } from "react";

import PageTitle from "../components/PageTitle";
import EmailCheck from "../components/EmailCheck";
import "../App.css";




const EnterEmailPage = () => {

  return (
      <div className="background" >
        <PageTitle />
        <EmailCheck />
      </div>
  );
};

export default EnterEmailPage;