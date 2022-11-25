import React from 'react'
import "./People.css"

function People({ first, last, work, school, picture}) {
  return (
    <div className='container'>
        <img src={picture} alt="" className="search_picture"></img>
        <div>
        <h1>{first}&nbsp;{last}</h1>
        {/* <h2>{work}   {school}</h2> */}
        </div>

        <button className='btn'>Chat</button>
    </div>

  )
}

export default People