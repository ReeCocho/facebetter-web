import React from 'react';
import logo from '../Logo.png'
import "../components/pageTitle.css"

function PageTitle()
{
   return(
     <div class='organize'>
      <img class="title" src={logo} ></img>
      <p class="subtitle">We dont steal your private information</p>
     </div>
   );
};

export default PageTitle;