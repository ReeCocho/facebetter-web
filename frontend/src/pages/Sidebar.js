import React from "react";
import "./Sidebar.css";
import SidebarOption from "../components/SidebarOption";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import logo from "../Logo.png";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Button } from "@mui/material";

function Sidebar() {
  const doLogout = event => 
  {
    event.preventDefault();
    localStorage.clear(); 
    window.location.href = '/';
  };  


  return (
    <div className="sidebar">
      <img className="title2" src={logo}></img>
      <a href="/components/Home">
        <SidebarOption className="cursor" Icon={HomeIcon} text="Home" />
      </a>
      <a href="/pages/Followers">
        <SidebarOption className="cursor" Icon={SearchIcon} text="Followers" />
      </a>
      <a href="/pages/Following">
        <SidebarOption
          className="cursor"
          Icon={NotificationsNoneIcon}
          text="Following"
        />
      </a>
      <a href="/pages/Chats">
        <SidebarOption className="cursor" Icon={MailOutlineIcon} text="Chats" />
      </a>
      <a href="/components/Profile">
        <SidebarOption
          className="cursor"
          Icon={MailOutlineIcon}
          text="Profile"
        />
      </a>
      <Button variant='outlined' className='sidebar__tweet' onClick={doLogout} fullWidth>
          Log Out
      </Button>
    </div>
  );
}

export default Sidebar;
