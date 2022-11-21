import React from "react";
import axios from "axios";

import PageTitle from "../components/PageTitle";
import Profile from "../components/Profile";

import LoggedInName from '../components/LoggedInName';
import Sidebar from './Sidebar';
import "../App.css";
import UploadFile from "../components/UploadFile";
import bp from "../components/Path";


const ProfilePage = () => {
  return (
    <div>
      <PageTitle />
      <LoggedInName />
      <Profile />
      <UploadFile
        onComplete={(result) => {
          let ud = JSON.parse(localStorage.getItem("user_data"));
          let userId = ud.userId;
          axios
            .post(bp.buildPath("api/updateprofilepic"), {
              _id: userId,
              FileUrl: result.fileUrl,
            })
            .then((res) => {
              console.log(res);
            })
            .catch((error) => {
              console.error(error);
            });
        }}
      />
    </div>
  );
};


export default ProfilePage;
