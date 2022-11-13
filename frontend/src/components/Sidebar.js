import React from 'react';
import './Sidebar.css';
import SidebarOption from './SidebarOption';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import logo from '../Logo.png'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Button } from "@mui/material";

function Sidebar() {
  return (
    <div className='sidebar'>
        <img className="title2" src={logo} ></img>
        <SidebarOption className="cursor" Icon={HomeIcon} text="Home"/>
        <SidebarOption className="cursor" Icon={SearchIcon} text="Followers"/>
        <SidebarOption className="cursor" Icon={NotificationsNoneIcon} text="Following"/>        
        <SidebarOption className="cursor" Icon={MailOutlineIcon} text="Chats"/>
        <SidebarOption className="cursor" Icon={MailOutlineIcon} text="Profile"/>         
    </div>
  )
}

export default Sidebar