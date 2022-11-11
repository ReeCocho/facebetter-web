import React from 'react';
import './Sidebar.css';
import SidebarOption from './SidebarOption';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Button } from "@mui/material";

function Sidebar() {
  return (
    <div className='sidebar'>

        <SidebarOption className="cursor" active Icon={HomeIcon} text="Home"/>
        <SidebarOption className="cursor" Icon={SearchIcon} text="Explore"/>
        <SidebarOption className="cursor" Icon={NotificationsNoneIcon} text="Notifications"/>        
        <SidebarOption className="cursor" Icon={MailOutlineIcon} text="Messages"/>        
        <SidebarOption className="cursor" Icon={BookmarkBorderIcon} text="Bookmarks"/>        
        <SidebarOption className="cursor" Icon={ListAltIcon} text="Lists"/>        
        <SidebarOption className="cursor" Icon={PermIdentityIcon} text="Profile"/>        
        <SidebarOption className="cursor" Icon={MoreHorizIcon} text="More"/>        


        <Button variant='outlined' className='sidebar__tweet' fullWidth>
            Tweet
        </Button>
    </div>
  )
}

export default Sidebar