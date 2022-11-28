import React from "react";

import PageTitle from "../components/PageTitle";
import ConfirmRegistration from '../components/ConfirmRegistration';
import "../App.css";

const ConfirmationPage = () =>
{
    return(
        <div className="confirmationPagina">
            <PageTitle />
            <ConfirmRegistration />
        </div>
    );
}

export default ConfirmationPage;