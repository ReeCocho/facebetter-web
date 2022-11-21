import React from 'react';
import './Profile.css';
import axios from "axios";
import People from './People_Search';

function HomeComp() {

  var bp = require('./Path.js');
  var searchName;

 
  
  function doSearch(){
    // incoming: search (ex: {"search": "dennis"})
    // outgoing: {Results: [ {_id: "6344e4ea7c568d2a25ed0f6f", FirstName: "Dennis", LastName: "Cepero", School: "UCF", Work: "Full Sail"}, {_id: "someoneelse", ...} ]}
    axios
    .post(bp.buildPath("api/searchprofiles") , {
      search: searchName.value,
    })
    .then((res) => {
      console.log(res.data.Results);
      localStorage.setItem('search_result', JSON.stringify(res.data.Results)); 
      window.location.href = "/components/Home/Search";   
    })
    .catch((error) => {
      console.error(error);
    });
  }
  
  var results = JSON.parse(localStorage.getItem("search_result"));

  if(window.location.pathname == "/components/Home" || window.location.pathname == "/pages/HomePage"){
    results = [];
  }



  return (
    <div className='main_div'>      
      <div className='header'>
        <h2>Home</h2>
      </div>

      <h1>Get Started, Search For Another User!</h1>
      <input 
        type="text"
        id="searchName"
        placeholder="Enter Name..."
        ref={(c) => (searchName = c)}
      />
      <input 
        type="submit"
        id="searchBtn"
        onClick={doSearch}
      />
      {results !== null && results.map(person => (
          <People first={person.FirstName}
          last={person.LastName} />
      ))}

    </div>
  )
}

export default HomeComp;