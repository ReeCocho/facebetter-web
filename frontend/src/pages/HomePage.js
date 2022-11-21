import React from "react";
import './HomePage.css';
import PageTitle from "../components/PageTitle";
import Profile from "../components/Profile";
import LoggedInName from '../components/LoggedInName';
import Sidebar from './Sidebar';
import Feed from '../components/Feed';
import "../App.css";
import Followers from "./Followers";
import Following from "./Following";
import Chats from "./Chats";
import Edit from "../components/Edit";
import HomeComp from "../components/Home";

const HomePage = () =>
{
    let component
    switch (window.location.pathname) {
        case "/pages/Followers":
            component = <Followers/>
            break;
        case "/pages/Following":
            component = <Following/>
            break;
        case "/components/Profile":
            component = <Profile/>
            break;
        case "/pages/Chats":
            component = <Chats/>
            break;
        case "/components/Edit":
            component = <Edit/>
            break;
        case "/components/Home":
            component = <HomeComp/>
            break;
        case "/components/Home/Search":
            component = <HomeComp/>
            break;
        case "/pages/HomePage":
            component = <HomeComp/>
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