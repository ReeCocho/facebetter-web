import React from 'react';
import logo from '../Logo.png'
import "../components/pageTitle.css"

function PageTitle()
{
   return(
     <div className='organize'>
        <img className="title" src={logo} ></img>
        <p className="subtitle">We dont steal your private information</p>
     </div>
   );
};

export default PageTitle;