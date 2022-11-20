import React from 'react'
import '../components/Profile.css';
import axios from "axios";
import People from '../components/People_Following';


function Followers() {
  return (
    <div className='main_div'>      
      <div className='header'>
        <h2>Followers</h2>
      </div>
    </div>
  )
}

export default Followers