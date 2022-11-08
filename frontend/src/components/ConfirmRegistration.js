import { application } from 'express';
import React from 'react';

function ConfirmRegistration()
{
    const ConfirmRegistration = event => 
    {
        application.get('/confirmation/:token'), async (req, res) => {
            try {
                const {user: { id } } = jwt.verify(req.params.token, process.env.EMAIL_SECRET);
            } catch (e) {
                console.log(e.toString());
            }
    
        }
        console.log("Confirmed");
    };    

  return(
   <div id="confirmDiv">
   <span id="message">Please Please Confirm of Registration?</span><br />
   <button type="button" id="confirmationButton" 
     onClick={ConfirmRegistration}> Confirm Registration </button>
   </div>
  );

};


export default ConfirmRegistration;