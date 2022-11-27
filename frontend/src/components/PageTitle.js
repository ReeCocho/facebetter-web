import React from 'react';
import logo from '../Logo.png'
import "../components/pageTitle.css"

function PageTitle()
{
   return(
     <div className='organize'>
         <img className="title" src={logo} ></img>
         <p className="subtitle">We Don't Steal Your Private Information!</p>
     </div>
   );
};

export default PageTitle;