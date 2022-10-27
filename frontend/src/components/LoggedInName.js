import React from 'react';

function LoggedInName()
{
    let ud = JSON.parse(localStorage.getItem('user_data'));
    let firstName = ud.firstName;
    let lastName = ud.lastName;

    const doLogout = event => 
    {
	    event.preventDefault();
      localStorage.removeItem("token_data");
      localStorage.removeItem("user_data");
      window.location.href = '/';
    };    

  return(
   <div id="loggedInDiv">
   <span id="userName">Logged In As {firstName} {lastName}</span><br />
   <button type="button" id="logoutButton" 
     onClick={doLogout}> Log Out </button>
   </div>
  );

};


export default LoggedInName;
