import React from "react";
import './HomePage.css';
import PageTitle from "../components/PageTitle";
import Profile from "../components/Profile";
import LoggedInName from '../components/LoggedInName';
import Sidebar from './Sidebar';
import Feed from '../components/Feed';
import "../App.css";
import Followers from "./otherPages/Followers";
import Following from "./otherPages/Following";
import Chats from "./otherPages/Chats";

const HomePage = () =>
{
    let component
    switch (window.location.pathname) {
        case "/pages/otherPages/Followers":
            component = <Followers/>
            break;
        case "/pages/otherPages/Following":
            component = <Following/>
            break;
        case "/components/Profile":
            component = <Profile/>
            break;
        case "/pages/otherPages/Chats":
            component = <Chats/>
            break;
        default:
            break;
    }

    console.log(window.location.pathname)
    return(
        <div className="app">
            <Sidebar />
            {component}
        </div>
    );
}

export default HomePage;