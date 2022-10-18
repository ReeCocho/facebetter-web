require('express');
require('mongodb');

exports.setApp = function ( app, client )
{
  app.post('/api/addcard', async (req, res, next) =>
  {
    // incoming: userId, color
    // outgoing: error
    
    const { userId, card } = req.body;
  
    const newCard = {Card:card,UserId:userId};
    var error = '';
  
    try
    {
      const db = client.db("SocialNetwork");
      const result = db.collection('Test').insertOne(newCard);
    }
    catch(e)
    {
      error = e.toString();
    }
  
    var ret = { error: error };
    res.status(200).json(ret);
  });
  
  
  app.post('/api/login', async (req, res, next) => 
  {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error
    
   var error = '';
  
    const { login, password } = req.body;
  
    const db = client.db("SocialNetwork");
    const results = await db.collection('Users').find({Login:login,Password:password}).toArray();
  
    var id = -1;
    var fn = '';
    var ln = '';
  
    if( results.length > 0 )
    {
      id = results[0]._id;
      fn = results[0].FirstName;
      ln = results[0].LastName;
    }
  
    var ret = { id:id, firstName:fn, lastName:ln, error:''};
    res.status(200).json(ret);
  });
  
  
  app.post('/api/searchcards', async (req, res, next) => 
  {
    // incoming: userId, search
    // outgoing: results[], error
  
    var error = '';
  
    const { userId, search } = req.body;
  
    var _search = search.trim();
    
    const db = client.db("SocialNetwork");
    const results = await db.collection('Test').find({"Card":{$regex:_search+'.*', $options:'r'}}).toArray();
    
    var _ret = [];
    for( var i=0; i<results.length; i++ )
    {
      _ret.push( results[i].Card );
    }
    
    var ret = {results:_ret, error:error};
    res.status(200).json(ret);
  });  

}