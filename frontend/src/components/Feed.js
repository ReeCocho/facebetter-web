import React, { useEffect, useState } from 'react'
import './Feed.css';
import Profile from './Profile';
import Edit from './Edit';


function Feed() {
  var state = false;

  function setState(newState){
    state = newState;
  }

  return (
    <div className='feed'>
        {/* Header */}
      <div className='profile__header'>
        <h2>Profile</h2>
        <input
            type="submit"
            id="editButton"
            value="Edit"
            onClick={setState(true)}
        />
      </div>
      {(!state) ? <Profile/> : <Edit/>}
 

        {/* Post */}


    </div>
  )
}

export default Feed;