import React, { useState } from 'react';

function Login()
{
    var bp = require('./Path.js');

    var storage = require('../tokenStorage.js');

    var loginName;
    var loginPassword;


    const [message,setMessage] = useState('');

    const doLogin = async event => 
    {
        event.preventDefault();

        var obj = {Login:loginName.value,Password:loginPassword.value};
        var js = JSON.stringify(obj);

        try
        {    
            const response = await fetch(bp.buildPath('api/login'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
            var res = JSON.parse(await response.text());

            if (res.Error !== null && res.Error !== undefined)
            {              
                setMessage('User/Password combination incorrect');
            }
            else
            {
                storage.storeToken(res);

                let userId = res.id;
                let firstName = res.fn;
                let lastName = res.ln;

                //var user = {firstName:res.FirstName,lastName:res.LastName,id:res.Id}
                //localStorage.setItem('user_data', JSON.stringify(user));

                setMessage('');
                window.location.href = '/cards';
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    
    };

    return(
      <div id="loginDiv">
        <form onSubmit={doLogin}>
        <span id="inner-title">PLEASE LOG IN</span><br />
        <input type="text" id="loginName" placeholder="Username" ref={(c) => loginName = c} /><br />
        <input type="password" id="loginPassword" placeholder="Password" ref={(c) => loginPassword = c} /><br />
        <input type="submit" id="loginButton" class="buttons" value = "Do It"
          onClick={doLogin} />
        </form>
        <span id="loginResult">{message}</span>
      </div>
    );
};

export default Login;