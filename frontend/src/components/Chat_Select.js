import React from "react";
import "./People.css";
import axios from "axios";

function Chat({ title, picture }) {
  //console.log(localStorage.getItem("JwtToken"));

  /*function doUnfollow(){
      axios
      .post(bp.buildPath("api/unfollow") , {
        _id: ud.userId,
        ToUnfollow: id,
        JwtToken: localStorage.getItem("access_token")
      })
      .then((res) => {
        console.log(res.data);
        console.log(first);
      })
      .catch((error) => {
        console.error(error);
      });
  }*/




  function handleChatClick(e) {
    e.stopPropagation();
    e.preventDefault();
    
  }


  const openChat = async () => {


  }

  return (
    // <div className='container'>
    //     <img src={picture} alt="" className="search_picture"></img>
    //     <a href='../components/User'
    //       onClick={viewProfile}>
    //       <div>
    //         <h1>{first}&nbsp;{last}</h1>
    //       </div>    
    //     </a>

    //     <button className='btn'>Chat</button>
    //     <input
    //         className='btn'
    //         type='submit'
    //         value="Unfollow"
    //         onClick={doUnfollow}>
    //     </input>
    // </div>

    <a>
      <div className='container'>
          <img src={picture} alt="" className="search_picture"></img>
          <h1>{title}</h1>
          <div>
            <button className="btn" onClick={handleChatClick}>Chat</button>
          </div> 
      </div>
    </a>

  )
}

export default Chat;
