import React from "react";

import PageTitle from "../components/PageTitle";
import Profile from "../components/Profile";
import LoggedInName from '../components/LoggedInName';
import "../App.css";
import UploadFile from "../components/UploadFile";

const ProfilePage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoggedInName />
            <Profile />
            <UploadFile />
        </div>
    );
}

export default ProfilePage;