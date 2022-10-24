import React, { useState } from 'react';

function CardUI()
{
    var card = '';
    var search = '';

    var bp = require('./Path.js');
    var storage = require('../tokenStorage.js');

    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [cardList,setCardList] = useState('');

    const ud = JSON.parse(localStorage.getItem('user_data'));
    const userId = ud.id;

    const addCard = async event => 
    {
	    event.preventDefault();

        var obj = {userId:userId, card:card.value, jwtToken: storage.retrieveToken()};
        var js = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath('api/addcard'),
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            var txt = await response.text();
            var res = JSON.parse(txt);

            if(res.Error !== null)
            {
                setMessage( "API Error:" + res.error );
            }
            else
            {
                setMessage('Card has been added');
                storage.storeToken(res.jwtToken);
            }
        }
        catch(e)
        {
            setMessage(e.toString());
        }

	};

    const searchCard = async event => 
    {
        event.preventDefault();
        		
        const obj = 
        {
            userId: userId,
            search: search.value,
            jwtToken: storage.retrieveToken()
        };
        const js = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath('api/searchcards'),
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            const txt = await response.text();
            const res = JSON.parse(txt);

            if (res.Error !== null)
            {
                throw res.Error;
            }

            let _results = res.results;
            let resultText = '';
            for( let i=0; i<_results.length; i++ )
            {
                resultText += _results[i];
                if( i < _results.length - 1 )
                {
                    resultText += ', ';
                }
            }

            storage.storeToken( res.jwtToken );
            setResults('Card(s) have been retrieved');
            setCardList(resultText);
        }
        catch(e)
        {
            alert(e.toString());
            setResults(e.toString());
        }
    };


    return(
        <div id="cardUIDiv">
        <br />
        <input type="text" id="searchText" placeholder="Card To Search For" ref={(c) => search = c} />
        <button type="button" id="searchCardButton" onClick={searchCard}> Search Card</button><br />
        <span id="cardSearchResult">{searchResults}</span>
        <p id="cardList">{cardList}</p><br /><br />
        <input type="text" id="cardText" placeholder="Card To Add" ref={(c) => card = c} />
        <button type="button" id="addCardButton" onClick={addCard}> Add Card </button><br />
        <span id="cardAddResult">{message}</span>
        </div>
    );
}

export default CardUI;
