import React from "react";

import PageTitle from "../components/PageTitle";
import Profile from "../components/Profile";
import LoggedInName from '../components/LoggedInName';
import "../App.css";

const ProfilePage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoggedInName />
            <Profile />
        </div>
    );
}

export default ProfilePage;