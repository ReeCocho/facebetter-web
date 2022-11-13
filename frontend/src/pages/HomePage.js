import React from "react";
import './HomePage.css';

import PageTitle from "../components/PageTitle";
import Profile from "../components/Profile";
import LoggedInName from '../components/LoggedInName';
import Sidebar from '../components/Sidebar';
import Feed from '../components/Feed';
import "../App.css";

const HomePage = () =>
{
    return(
        <div className="app">
    
            <Sidebar />
            <Feed />

        </div>
    );
}

export default HomePage;