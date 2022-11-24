import React from "react";
import "./People.css";

function People({ first, last, work, school, picture }) {
  return (
    <div className="container">
      <img src={picture} alt="" id="search_picture"></img>
      <div>
        <h1>{first}&nbsp;</h1>
        <h1>{last}</h1>
      </div>

      <button className="btn">Chat</button>
    </div>
  );
}

export default People;
