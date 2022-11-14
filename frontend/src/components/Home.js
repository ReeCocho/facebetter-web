import React from 'react';
import './Profile.css';

function HomeComp() {


  return (
    <div className='main_div'>      
      <div className='header'>
        <h2>Home</h2>
      </div>

      <h1>Get Started, Search For Another User!</h1>
      <input 
          type="text"
          id="searchName"
        />
    </div>
  )
}

export default HomeComp;