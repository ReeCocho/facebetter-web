import React from 'react'
import "./People.css"

function People({ first, last, work, school, picture, id}) {
  const viewProfile = async () => {
    console.log(id);
    console.log(first);
    localStorage.setItem("search_profile", id);    

  }
  
  return (
    <div className='container'>
        <img src={picture} alt="" className="search_picture"></img>
        <a href='../components/User'
          onClick={viewProfile}>
          <div>
            <h1>{first}&nbsp;{last}</h1>
          </div>    
        </a>

        <button className='btn'>Chat</button>
    </div>

  )
}

export default People