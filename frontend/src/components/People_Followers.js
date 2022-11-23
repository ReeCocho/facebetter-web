import React from 'react'
import "./People.css"

function People({ first, last, work, school}) {
  return (
    <div className='container'>
        <div>
        <h1>{first}{last}</h1>
        <h2>{work}   {school}</h2>
        </div>

        <button className='btn'>Chat</button>
    </div>

  )
}

export default People