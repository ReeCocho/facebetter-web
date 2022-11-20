import React from 'react'
import "./People.css"
import axios from "axios";

function People({ first, last}) {

    var bp = require('./Path.js');
    var results = JSON.parse(localStorage.getItem("search_result"));
    let ud = JSON.parse(localStorage.getItem('user_data'));
    
    function doFollow(){
        axios
        .post(bp.buildPath("/api/follow") , {
          _id: ud.userId,
          ToFollow: first,
        })
        .then((res) => {
          console.log(res.data.Results);
        })
        .catch((error) => {
          console.error(error);
        });
    }


  return (
    <div className='container'>
        <div>
        <h1>{first}{last}</h1>
        </div>

        <button className='btn'>Chat</button>
        <input
            className='btn'
            type='submit'
            value="Follow">
        </input>

    </div>

  )
}

export default People