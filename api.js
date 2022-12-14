const { ObjectId, ObjectID } = require('mongodb');

require('express');
require('mongodb');
const token = require("./createJWT.js");
const mailer = require("./mailer.js");
const jwt = require("jsonwebtoken");

exports.setApp = function ( app, wss, client )
{
  // Initializing state for the chat
  wss.chat = {
    // Maps channel `ObjectId`s to a set of clients connected to them.
    channels: new Map(),
    // Maps connected user `ObjectId`s to the channel `ObjectId` they are connected to.
    userConnectedTo: new Map(),
    // Maps conneted user `ObjectId`s to their websocket.
    clients: new Map(),
  };

  setInterval(function() {
    try {
      wss.chat.clients.forEach((client) => {
        client.send(JSON.stringify({
          Ping: true
        }));
      });
    } catch (e) {
      console.log(e.toString());
    }
  }, 5000);

  wss.on('connection', function(ws, request) 
  {
    ws.on('message', function(msg) {
      try
      {
        // Verify identification message was successful
        const data = JSON.parse(msg.toString());
        if(data.Ping !== undefined){
          return;
        }
        let err = verifyObject(
          data,
          {
            JwtToken: "string",
            Channel: "string"
          }
        );
  
        if (err !== null)
        {
          throw err;
        }

        // Verify JWT
        if (token.isExpired(data.JwtToken))
        {
          throw "Token is expired";
        }

        // Update the client object with their ID so we know who they are
        let ud = jwt.decode(data.JwtToken, { complete: true });

        // Generate a unique ID for the connected client
        const oldId = ws.clientId;

        while (true)
        {
          ws.clientId = ud.payload.userId + Math.random().toString(16).slice(2);
          if (wss.chat.clients.get(ws.clientId) === undefined)
          {
            break;
          }
        }
        
        // Decode channel
        let channel;
        if (data.Channel === "")
        {
          channel = null;
        }
        else
        {
          channel = data.Channel;
        }

        // Remove client from old channel
        wss.chat.clients.delete(oldId);
        if (ws.channel !== undefined && oldId !== undefined)
        {
          wss.chat.channels.get(ws.channel).delete(oldId);
        }
        ws.channel = channel;

        // Insert client into sets
        wss.chat.userConnectedTo.set(ws.clientId, channel);
        wss.chat.clients.set(ws.clientId, ws);
        if (wss.chat.channels.get(channel) === undefined)
        {
          wss.chat.channels.set(channel, new Set());
        }
        wss.chat.channels.get(channel).add(ws.clientId);

        console.log('Client ' + ws.clientId + ' connected.');
      }
      catch (e)
      {
        const err = {
          Error: e.toString()
        };
        ws.send(JSON.stringify(err));
      }
    });

    ws.on('close', (code) => 
    {
      if (ws.clientId !== undefined) 
      {
        wss.chat.channels.delete(ws.clientId);
        console.log('Client ' + ws.clientId + ' disconnected');
      }
    });
  });  

  app.post('/api/sendmessage', async (req, res, next) => {
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          Channel: "string",
          Message: "string",
          JwtToken: "string",
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and decode token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      let ud = jwt.decode(obj.JwtToken, { complete: true }).payload;

      // Ensure that the user has access to the channel
      const db = client.db("SocialNetwork");
      const userInChannel = await db.collection('Channels')
        .findOne({
          _id: ObjectId(obj.Channel),
          Members: ObjectId(ud.userId)
        }) !== null;

      if (!userInChannel)
      {
        throw "User is not in this channel";
      }

      // Add the message to the database
      const dateCreated = new Date(Date.now());
      await db.collection('Messages')
        .insertOne({
          Sender: ObjectId(ud.userId),
          Channel: ObjectId(obj.Channel),
          Content: obj.Message,
          DateCreated: dateCreated
        });

      // Notify all clients in the channel of the new message
      const msg = JSON.stringify(
      {
        Sender: "",
        SenderId: ud.userId,
        ChannelId: obj.Channel,
        Content: obj.Message,
        DateCreated: dateCreated,
      });

      let channel = wss.chat.channels.get(obj.Channel);
      if (channel !== undefined)
      {
        for (const clientId of channel)
        {
          let client = wss.chat.clients.get(clientId);
          if (client !== undefined)
          {
            client.send(msg);
          }
        }
      }

      const ret = { Error: null };
      res.status(200).json(ret);
    }
    catch(e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/getmessages', async (req, res, next) => {
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          Channel: "string",
          JwtToken: "string",
          Before: "number",
          Count: "number"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and decode token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;

      // Ensure that the user has access to the channel
      const db = client.db("SocialNetwork");
      const userInChannel = await db.collection('Channels')
        .findOne({
          _id: ObjectId(obj.Channel),
          Members: ObjectId(ud.userId)
        }) !== null;

      if (!userInChannel)
      {
        throw "User is not in this channel";
      }

      // Get messages sorted from newest to oldest using the offset and count
      const messages = await db.collection('Messages')
        .find({
          Channel: ObjectId(obj.Channel),
          DateCreated: {
            $lt: new Date(obj.Before)
          }
        })
        .limit(obj.Count)
        .sort({
          DateCreated: -1
        })
        .map((msg) => {
          return {
            SenderId: ObjectId(msg.Sender),
            ChannelId: ObjectId(obj.Channel),
            Content: msg.Content,
            DateCreated: new Date(msg.DateCreated)
          }
        })
        .toArray();

      const ret = { Error: null, Messages: messages };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/createchannel', async (req, res, next) => {
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          JwtToken: "string",
          Title: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;
      const refreshedToken = token.refresh(obj.JwtToken);

      // Create the channel
      const db = client.db("SocialNetwork");
      const newChannel = await db.collection('Channels').insertOne({
        Owner: ObjectId(ud.userId),
        Title: obj.Title,
        Members: [ObjectId(ud.userId)],
        DateCreated: new Date(Date.now())
      });

      // Update the user with the new channel
      await db
        .collection('Users')
        .updateOne(
          { _id: ObjectId(ud.userId) }, 
          { $addToSet: { Channels: newChannel.insertedId } }
        );

      const ret = { Error: null, JwtToken: refreshedToken };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/deletechannel', async (req, res, next) => {
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          JwtToken: "string",
          Channel: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;
      const refreshedToken = token.refresh(obj.JwtToken);

      // User must be the owner of the channel
      const db = client.db("SocialNetwork");
      const userIsOwner = await db.collection('Channels')
        .findOne({
          _id: ObjectId(obj.Channel),
          Owner: ObjectId(ud.userId)
        }) !== null;

      if (!userIsOwner)
      {
        throw "You must be the owner of the channel in order to delete the channel.";
      }

      // Remove the channel from every users channel list
      const channel = await db.collection('Channels')
        .findOne({
          _id: ObjectId(obj.Channel),
        });
      
      if (channel) 
      {
        for (const member of channel.Members)
        {
          await db
            .collection('Users')
            .update(
              { _id: ObjectId(member) }, 
              { $pull: { Channels: ObjectId(obj.Channel) } }
            );
        }
      }
      
      // Delete the channel
      await db.collection('Channels')
        .deleteOne({
          _id: ObjectId(obj.Channel),
        });

      const ret = { Error: null, JwtToken: refreshedToken };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/getinvitecode', async (req, res, next) => {
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          JwtToken: "string",
          Channel: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;
      const refreshedToken = token.refresh(obj.JwtToken);

      // User must be the owner of the channel in order to create an invite code
      const db = client.db("SocialNetwork");
      const userIsOwner = await db.collection('Channels')
        .findOne({
          _id: ObjectId(obj.Channel),
          Owner: ObjectId(ud.userId)
        }) !== null;

      if (!userIsOwner)
      {
        throw "You must be the owner of the channel in order to create an invite code.";
      }

      // Create the invite code
      const inviteCode = jwt.sign(
        { channel: obj.Channel },
        process.env.INVITE_CODE_SECRET,
        { expiresIn: '1d' }
      );

      const ret = { Error: null, InviteCode: inviteCode, JwtToken: refreshedToken };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/joinchannel', async (req, res, next) => {
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          JwtToken: "string",
          InviteCode: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;
      const refreshedToken = token.refresh(obj.JwtToken);

      // Verify the invite code
      const isValidInvite = jwt.verify(
        obj.InviteCode, 
        process.env.INVITE_CODE_SECRET, 
        (err, verifiedJwt) =>
        {
          if (err)
          {
            return false;
          }
          else
          {
            return true;
          }
        }
      );

      if (!isValidInvite)
      {
        throw "Invite code expired";
      }

      // Add the user to the channel and update the users channel list
      const channel = ObjectId(jwt.decode(obj.InviteCode, {complete:true}).payload.channel);
      const db = client.db("SocialNetwork");
      
      await db
        .collection('Channels')
        .updateOne(
          { _id: channel }, 
          { $addToSet: { Members: ObjectId(ud.userId) } }
        );

      await db
        .collection('Users')
        .updateOne(
          { _id: ObjectId(ud.userId) }, 
          { $addToSet: { Channels: channel } }
        );

      const ret = { Error: null, JwtToken: refreshedToken };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/listmembers', async (req, res, next) => {
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          JwtToken: "string",
          Channel: "string",
          Offset: "number",
          Count: "number"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;
      const refreshedToken = token.refresh(obj.JwtToken);

      // Get the members only if the user is also a member
      const db = client.db("SocialNetwork");
      const channel = await db.collection('Channels')
        .findOne({
          _id: ObjectId(obj.Channel),
          Members: ObjectId(ud.userId)
        });

      if (channel === null)
      {
        throw "Channel does not exist or you are not a member";
      }

      const ret = 
      { 
        Error: null, 
        Members: channel.Members.slice(obj.Offset, obj.Offset + obj.Count), 
        JwtToken: refreshedToken 
      };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/verifytoken', async (req, res, next) => {
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          JwtToken: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;
      const refreshedToken = token.refresh(obj.JwtToken);

      const ret = { Error: null, JwtToken: refreshedToken };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/getchannels', async (req, res, next) => {
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          JwtToken: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;
      const refreshedToken = token.refresh(obj.JwtToken);

      const db = client.db("SocialNetwork");
      const user = await db
        .collection('Users')
        .findOne(
          { _id: ObjectId(ud.userId) }
        );

      if (user === null)
      {
        throw "No user found";
      }

      const ret = { 
        Error: null, 
        Channels: user.Channels, 
        JwtToken: refreshedToken 
      };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/addcard', async (req, res, next) =>
  {
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          _id: "string",
          card: "string",
          JwtToken: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const refreshedToken = token.refresh(obj.JwtToken);

      // Add the card to the data base
      const newCard = { Card: obj.card, UserId: obj._id };
      const db = client.db("SocialNetwork");
      db.collection('Test').insertOne(newCard);
      
      // Refresh JwtToken
      const ret = { Error: err, JwtToken: refreshedToken };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });
  
  
  app.post('/api/login', async (req, res, next) => 
  {    
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          Login: "string",
          Password: "string"
        }
      );

      if (err !== null) 
      {
        throw err;
      }

      // Find the user
      const db = client.db("SocialNetwork");
      results = await db
        .collection('Users')
        .find({Login: obj.Login, Password: obj.Password})
        .toArray();

      if (results.length == 0) 
      {
        throw "Username/password is incorrect.";
      }

      // Account must be verified
      if (!results[0].AccountVerified)
      {
        throw "Please verify your email account.";
      }

      // Create a token from the user info and send to the client
      const tok = token.createToken(results[0].FirstName, results[0].LastName, results[0]._id);
      const ret = { JwtToken: tok, Error: null};
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });


  app.post('/api/register', async (req, res, next) => {
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          Login: "string",
          Password: "string",
          Email: "string",
          FirstName: "string",
          LastName: "string",
          School: "string",
          Work: "string"
        }
      );

      if (err !== null) 
      {
        throw err;
      }

      if (obj.Login.length === 0) 
      {
        throw "login is empty";
      }
    
      if (obj.Password.length === 0) 
      {
        throw "password is empty";
      }
    
      if (obj.FirstName.length === 0) 
      {
        throw "first name is empty";
      }
    
      if (obj.LastName.length === 0) 
      {
        throw "last name is empty";
      }      
      // User must not already exist
      const db = client.db("SocialNetwork");
      results = await db.collection('Users').find({ Login: obj.Login}).toArray();
  
      if (results.length !== 0) 
      {
        throw "user with existing login already exists";
      }

      // Add user
      const newUser = 
      {
        Login: obj.Login,
        Password: obj.Password,
        FirstName: obj.FirstName,
        LastName: obj.LastName,
        Email: obj.Email,
        Following: [],
        School: obj.School,
        Work: obj.Work,
        Followers: [],
        AccountVerified: false,
        Channels: [],
        ProfilePicture: "https://facebetter.s3.amazonaws.com/public/default.png"
      };

      db.collection('Users').insertOne(newUser);

      // Send the verification email
      let e = mailer.sendConfirmationEmail(obj.Login, obj.Password, obj.Email);
      if(e !== null)
      {
        throw e;
      }

      const ret = { Error: null };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });
  
  app.post('/api/verifyemail', async (req, res, next) => {
    try
    {
      // Verification of input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          JwtToken: "string"
        }
      );

      if (err !== null) 
      {
        throw err;
      }

      // Verify the token is still valid
      const isError = jwt.verify(
        obj.JwtToken, 
        process.env.EMAIL_SECRET, (err, verifiedJwt) =>
        {
          if (err)
          {
            return true;
          }
          else
          {
            return false;
          }
        }
      );
      
      if (isError)
      {
        throw "Token is expired";
      }

      // Decode the token
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;

      // Mark email as verified
      const db = client.db("SocialNetwork");
      await db
        .collection('Users')
        .updateOne(
          { Login: ud.name, Password: ud.pass }, 
          { $set: { AccountVerified: true } }
        );

      const ret = { Error: null };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/searchcards', async (req, res, next) => 
  {
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          _id: "string",
          search: "string",
          JwtToken: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const refreshedToken = token.refresh(obj.JwtToken);

      // Perform search and collect results
      let _search = obj.search.trim();
      const db = client.db("SocialNetwork");
      const results = await db.collection('Test').find({"Card":{$regex:_search+'.*', $options:'r'}}).toArray();
      
      let _ret = [];
      for (let i = 0; i < results.length; i++)
      {
        _ret.push(results[i].Card);
      }
      
      const ret = { results: _ret, Error: null, JwtToken: refreshedToken };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });  

  app.post('/api/follow', async (req, res, next) => {
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          _id: "string",
          ToFollow: "string",
          JwtToken: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const refreshedToken = token.refresh(obj.JwtToken);

      // Get the ID of the person want to follow
      const db = client.db("SocialNetwork");
      let results = await db
        .collection('Users')
        .find({ Login: obj.ToFollow })
        .toArray();
      
      if (results.length === 0)
      {
        throw "User does not exist";
      }

      const toFollowId = results[0]._id;

      // Make sure we aren't trying following ourselves
      if (toFollowId.equals(ObjectId(obj._id)))
      {
        throw "Attempted to follow yourself";
      }

      // Add the user to our following list
      await db
        .collection('Users')
        .updateOne(
          { _id: ObjectId(obj._id) }, 
          { $addToSet: { Following: ObjectId(toFollowId) } }
        );
        
      // Add ourselves to the other users to our followers list
      await db
        .collection('Users')
        .updateOne(
          { _id: ObjectId(toFollowId) }, 
          { $addToSet: { Followers: ObjectId(obj._id) } }
        );

      const ret = { Error: null, JwtToken: refreshedToken };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/unfollow', async (req, res, next) => {
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          _id: "string",
          ToUnfollow: "string",
          JwtToken: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const refreshedToken = token.refresh(obj.JwtToken);

      const db = client.db("SocialNetwork");

      // Remove the user from our following list
      await db
        .collection('Users')
        .updateOne(
          { _id: ObjectId(obj._id) }, 
          { $pull: { Following: ObjectId(obj.ToUnfollow) } }
        );

      // Remove ourselves from the users followers list
      await db
        .collection('Users')
        .updateOne(
          { _id: ObjectId(obj.ToUnfollow) }, 
          { $pull: { Followers: ObjectId(obj._id) } }
        );

      const ret = { Error: null, JwtToken: refreshedToken };
      res.status(200).json(ret);
    }
    catch(e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/retrieveprofile', async (req, res, next) => {
    // incoming: _id (ex: {_id: "6344e4ea7c568d2a25ed0f6f"})
    // outgoing: {_id, Login, FirstName, LastName, Following, Followers, School, Work, Error} 
    const obj = req.body;

    let err = verifyObject(obj, {_id: "string"});
  
    if (err !== null)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }

    let results;
    try 
    {
      const db = client.db("SocialNetwork");
      let objId = new ObjectId(obj._id)
      results = await db
        .collection('Users')
        .find({_id: objId})
        .toArray();
    } 
    catch(e) 
    {
      err = e.toString();
    }
  
    if (err !== null)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }

    // check if there is a profile with this ID
    if (results.length === 0)
    {
      var ret = { Error: "cannot find user with that ID" };
      res.status(200).json(ret);
      return;
    }
  
    var ret = 
    { 
      Id: results[0]._id,
      Login: results[0].Login, 
      FirstName: results[0].FirstName, 
      LastName: results[0].LastName, 
      Following: results[0].Following,
      Followers: results[0].Followers,
      School: results[0].School,
      Work: results[0].Work,
      ProfilePicture: results[0].ProfilePicture,
      Bio: results[0].Bio,
      Error: err
    };
    res.status(200).json(ret);
  });
  
  // requires ALL fields to be sent
  // send original/old info for things not to be updated,
  // send updated text for things to be updated
  app.post('/api/editprofile', async (req, res, next) => {
    // incoming: {_id: "6344e4ea7c568d2a25ed0f6f", FirstName: "NewFirst", LastName: "NewLast", ..., JwtToken: "tokennnnn"}
    // outgoing: {err: "error message", JwtToken: "newtoken"}
    const obj = req.body;

    let err = verifyObject(obj, {
      _id: "string",
      FirstName: "string", 
      LastName: "string", 
      School: "string", 
      Work: "string",
      Bio: "string",
      JwtToken: "string"
    });
  
    if (err !== null)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }

    // Verify and refresh token
    if (token.isExpired(obj.JwtToken))
    {
      throw "Token is expired";
    }
    const refreshedToken = token.refresh(obj.JwtToken);

    let results;
    try 
    {
      const db = client.db("SocialNetwork");
      let objId = new ObjectId(obj._id)
      let newFirstName = obj.FirstName;
      let newLastName = obj.LastName;
      let newSchool = obj.School;
      let newWork = obj.Work;
      let newBio = obj.Bio;
      let newLogin = obj.Login;

      let filter = {_id: objId}
      let updates = {
        FirstName: newFirstName,
        LastName: newLastName,
        School: newSchool,
        Work: newWork,
        Bio: newBio,
        Login: newLogin
      }

      results = await db
        .collection('Users')
        .updateMany(filter, {$set: updates})
    } 
    catch(e) 
    {
      err = e.toString();
    }
  
    if (err !== null)
    {
      var ret = { Error: err, JwtToken: refreshedToken };
      res.status(200).json(ret);
      return;
    }

    // if there are no matches, that means we cannot find a user with that ID
    if (results.matchedCount === 0)
    {
      var ret = { Error: "cannot find user with that ID", JwtToken: refreshedToken };
      res.status(200).json(ret);
      return;
    }
  
    var ret = {Error: null, JwtToken: refreshedToken};
    res.status(200).json(ret);
  });
  

  app.post('/api/searchprofiles', async (req, res, next) => {
    // incoming: search (ex: {"search": "dennis"})
    // outgoing: {Results: [ {_id, Login, FirstName, LastName, School, Work}, {_id: "someoneelse", ...} ]}
    const obj = req.body;

    let err = verifyObject(obj, {search: "string"});
    let regexSearchString = obj.search + ".*";
  
    if (err !== null)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }

    let results;
    try 
    {
      const db = client.db("SocialNetwork");
      let objId = new ObjectId(obj._id)
      results = await db
        .collection('Users')
        .find(
          {
            "$or": [
              {"FirstName":    {"$regex": regexSearchString, "$options": "i"}},
              {"LastName":     {"$regex": regexSearchString, "$options": "i"}},
            ]
          }
        )
        .project(
          {
            _id: 1,
            Login: 1,
            FirstName: 1,
            LastName: 1,
            School: 1,
            Work: 1,
            ProfilePicture: 1
          }
        )
        .toArray();
    } 
    catch(e) 
    {
      err = e.toString();
    }
  
    if (err !== null)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }
  
    var ret = 
    { 
      Results: results
    };
    res.status(200).json(ret);
  });


  app.post('/api/searchfollowing', async (req, res, next) => {
    // incoming: search (ex: {_id:"thepersonwhosefollowersyouwanttosearch", "search": "whatyouwanttosearchfor"})
    // outgoing: {Results: [ {_id: "6344e4ea7c568d2a25ed0f6f", FirstName: "Dennis", LastName: "Cepero", School: "UCF", Work: "Full Sail"}, {_id: "someoneelse", ...} ]}
    const obj = req.body;

    let err = verifyObject(obj, {_id: "string", search: "string"});
    let regexSearchString = obj.search + ".*";
  
    if (err !== null)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }

    let results;
    try 
    {
      const db = client.db("SocialNetwork");
      results = await db
      .collection('Users')
      .find(
        {
          Followers: new ObjectId(obj._id), // to search this user's Followings, search who Follows this user
          "$or": [
            {"FirstName":    {"$regex": regexSearchString, "$options": "i"}},
            {"LastName":     {"$regex": regexSearchString, "$options": "i"}},
          ]
        }
      )
      .project({FirstName: 1, LastName: 1, School: 1, Work: 1})
      .toArray()
    } 
    catch(e) 
    {
      err = e.toString();
    }
  
    if (err !== null)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }
  
    var ret = 
    { 
      Results: results
    };
    res.status(200).json(ret);
  });

  app.post('/api/resetpassword', async (req, res, next) => {
    // incoming: {NewPassword: 'their_new_password', JwtToken: 'thetoken'}
    // outgoing: {err}
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          NewPassword: "string",
          JwtToken: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }
      
      // Verify the token is still valid
      const isError = jwt.verify(
        obj.JwtToken, 
        process.env.EMAIL_SECRET, (err, verifiedJwt) =>
        {
          if (err)
          {
            return true;
          }
          else
          {
            return false;
          }
        }
      );
      
      if (isError)
      {
        throw "Token is expired";
      }      
      // Verify and refresh token
      //if (token.isExpired(obj.JwtToken))
      //{
      //  throw "Token is expired";
      //}
      //const refreshedToken = token.refresh(obj.JwtToken);

      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;
      const db = client.db("SocialNetwork");
      let ObjId = ObjectId(ud.id);
      let filter = {_id: ObjId};

      let results = await db
        .collection('Users')
        .updateOne(filter, {$set: {Password: obj.NewPassword}});

      if (results.matchedCount === 0)
      {
        throw "User does not exist";
      }
      
      if (results.modifiedCount === 0)
      {
        throw "Already using this password";
      }

      const ret = { Error: null };
      res.status(200).json(ret);
    }
    catch (e)
    {
      console.log(e.toString());
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/checkemail', async (req, res, next) => {
    // incoming: {Email: "person@mail.com"}
    // outgoing: {_id: "97a8s7df98pa78s7dfpas", err: Error}
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          Email: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }


      const db = client.db("SocialNetwork");
      let results = await db
        .collection('Users')
        .find( { Email: obj.Email } )
        .toArray();

      if (results.length === 0)
      {
        throw "User with this email does not exist";
      }

      //Send Password Reset Link
      let e = mailer.sendPwResetEmail(results[0]._id, obj.Email);
      if(e !== null)
      {
        console.log(e.toString());
        throw e;
      } 
      
      const ret = { Error: null, _id: results[0]._id };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/updateprofilepic', async (req, res, next) => {
    // incoming: 
    // outgoing: 
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          _id: "string",
          FileUrl: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }


      let objId = new ObjectId(obj._id)
      let filter = {_id: objId}
      let updates = {
        ProfilePicture: obj.FileUrl,
      }
      const db = client.db("SocialNetwork");
      await db
        .collection('Users')
        .updateMany(filter, {$set: updates})

      results = await db
        .collection('Users')
        .find({_id: objId})
        .toArray();


      if (results.length === 0)
      {
        throw "User with ID not found";
      }
      
      var ret = 
      { 
        Id: results[0]._id, 
        FirstName: results[0].FirstName, 
        LastName: results[0].LastName, 
        Following: results[0].Following,
        Followers: results[0].Followers,
        School: results[0].School,
        Work: results[0].Work,
        ProfilePicture: results[0].ProfilePicture,
        Error: err
      };

      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });


  app.post('/api/customrequest', async (req, res, next) => {
    // incoming: {_id: "...", Request: "Login"}
    // outgoing: {_id: "97a8s7df98pa78s7dfpas", err: Error}
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(obj, {_id: "string", Request: "string"});

      if (err !== null)
      {
        throw err;
      }

      if (obj.Request == "Password")
        throw "Not allowed to request this"


      const db = client.db("SocialNetwork");
      let results = await db
        .collection('Users')
        .find( { _id: ObjectId(obj._id) } )
        .project( { _id: 0, [obj.Request]: 1} )
        .toArray();

      if (results.length === 0)
      {
        throw "User with this _id does not exist";
      }

      if (Object.keys(results[0]).length === 0)
        throw "That attribute does not exist for this user"
      
      const ret = { Error: null, Result: results[0][obj.Request] };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/updateprofilepic', async (req, res, next) => {
    // incoming: 
    // outgoing: 
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          _id: "string",
          FileUrl: "string"
        }
      );

      if (err !== null)
      {
        throw err;
      }


      let objId = new ObjectId(obj._id)
      let filter = {_id: objId}
      let updates = {
        ProfilePicture: obj.FileUrl,
      }
      const db = client.db("SocialNetwork");
      await db
        .collection('Users')
        .updateMany(filter, {$set: updates})

      results = await db
        .collection('Users')
        .find({_id: objId})
        .toArray();


      if (results.length === 0)
      {
        throw "User with ID not found";
      }
      
      var ret = 
      { 
        Id: results[0]._id, 
        FirstName: results[0].FirstName, 
        LastName: results[0].LastName, 
        Following: results[0].Following,
        Followers: results[0].Followers,
        School: results[0].School,
        Work: results[0].Work,
        ProfilePicture: results[0].ProfilePicture,
        Error: err
      };

      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  app.post('/api/getchanneltitle', async (req, res, next) => {
    try
    {
      // Verify input
      const obj = req.body;
      let err = verifyObject(
        obj,
        {
          Channel: "string",
          JwtToken: "string",
        }
      );

      if (err !== null)
      {
        throw err;
      }

      // Verify and decode token
      if (token.isExpired(obj.JwtToken))
      {
        throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;

      // Ensure that the user has access to the channel
      const db = client.db("SocialNetwork");
      const channel = await db.collection('Channels')
        .findOne({
          _id: ObjectId(obj.Channel),
          Members: ObjectId(ud.userId)
        });
		
	  if (channel === null)
	  {
		  throw "Channel does not exist or user is not a member.";
	  }

      const ret = { Error: null, Title: channel.Title };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });

  
  app.post('/api/createdm', async (req, res, next) => {
    try
    {
      // Verification
      const obj = req.body;
      let err = verifyObject(
      obj,
      {
        JwtToken: "string",
        OtherUserId: "string"
      }
      );
    
      if (err !== null)
      {
      throw err;
      }
    
      // Verify and refresh token
      if (token.isExpired(obj.JwtToken))
      {
      throw "Token is expired";
      }
      const ud = jwt.decode(obj.JwtToken, { complete: true }).payload;
      const refreshedToken = token.refresh(obj.JwtToken);
      
      // Check if a DM already exists
      const db = client.db("SocialNetwork");
      const channel = await db.collection('Channels')
      .findOne({
        Members:{$all:[ObjectId(ud.userId), ObjectId(obj.OtherUserId)]},
        IsDM: true
      });
    
      if (channel !== null)
      {
      const ret = { Error: null, JwtToken: refreshedToken, Channel: channel._id };
      res.status(200).json(ret);
      return;
      }
    
      // Create the channel if it doesn't exist
      const newChannel = await db.collection('Channels').insertOne({
        Owner: ObjectId(ud.userId),
        Title: "DM: " + ud.userId + " " + obj.OtherUserId,
        Members: [ObjectId(ud.userId), ObjectId(obj.OtherUserId)],
        DateCreated: new Date(Date.now()),
        IsDM: true
      });
    
      // Update the users with the new channel
      await db
      .collection('Users')
      .updateOne(
        { _id: ObjectId(ud.userId) }, 
        { $addToSet: { DMs: newChannel.insertedId } }
      );
      
      await db
      .collection('Users')
      .updateOne(
        { _id: ObjectId(obj.OtherUserId) }, 
        { $addToSet: { DMs: newChannel.insertedId } }
      );
    
      const ret = { Error: null, JwtToken: refreshedToken, Channel: newChannel.insertedId };
      res.status(200).json(ret);
    }
    catch (e)
    {
      const ret = { Error: e.toString() };
      res.status(200).json(ret);
    }
  });
  

  /**
   * Takes in an `obj` to verify the layout and data types of. Use this any time you receive data
   * data from a client (whether that be from a POST or over a socket).
   * 
   * `desc` is a description of what `obj` is expected to look like. The fields of `desc` should be
   * named the same as those of `obj`.
   * 
   * Take this as an example of `desc`:
   * 
   * ```
   * let desc = {
   *   name: "string",
   *   age: "number",
   *   is_male: "boolean",
   *   friends: [ "string" ],
   *   other_data: {
   *     a: "string",
   *     b: "number"
   *   }
   * };
   * ```
   * 
   * This `desc` object says that we are expecting...
   * - A field called `name` that is a string.
   * - A field called `age` that is a number.
   * - A field called `is_male` that is a boolean.
   * - A field called `friends` that which an array that contains strings.
   * - A field called `other_data` that is an object with a field called `a` that is a string and a 
   *   field called `b` that is a number.
   * 
   * # Notes
   * - Nested arrays are not supported.
   * 
   * @param obj The object to verify.
   * @param desc A description of the object to verify against.
   * @return `null` if there was no mismatch. Otherwise, a string describing the error.
   */
  function verifyObject(obj, desc) 
  {
    for (let field in desc) 
    {
      // Determine the expected (desc) type and the actual (obj) type
      let desc_ty;
      if (typeof desc[field] === "object")
      {
        if (Array.isArray(desc[field]))
        {
          desc_ty = "array";
        }
        else
        {
          desc_ty = "object";
        }
      }
      else
      {
        desc_ty = desc[field];
      }
      const obj_ty = typeof obj[field];
          
      switch (obj_ty) 
      {
        // Primitives are handled simply
        case "string":
        case "number":
        case "boolean":
        if (desc_ty !== obj_ty)
        {
          return "field `" + field + "` expected type of `" + desc_ty + "` but received `" + obj_ty + "`";
        }
        break;
            
        // Objects are special because technically arrays are also objects
        case "object":
          // Cannot be null
          if (desc[field] === null || obj[field] === null)
          {
            return "field `" + field + "` cannot be `null`";
          }

          // If one of the two fields is an array, they must both be arrays.
          const desc_is_arr = Array.isArray(desc[field]);
          const obj_is_arr = Array.isArray(obj[field]);
          if (desc_is_arr || obj_is_arr) 
          {
            if (!desc_is_arr)
            {
              return "field `" + field + "` expected type of `object` but received `array`";
            }
            
            if (!obj_is_arr)
            {
              return "field `" + field + "` expected type of `array` but received `object`";
            }
            
            // Both are arrays. Now verify contents.
            if (desc[field].length === 0)
            {
              return "field `" + field + "` is an array but contains no descriptor";
            }
            
            // If the elements of the array are meant to be objects, recurse
            const inner = desc[field][0];
            if (typeof inner === "object")
            {
              // Cannot be null
              if (desc[field][0] === null)
              {
                return "field `" + field + "` cannot be `null`";
              }
              
              for (let i = 0; i < obj[field].length; ++i)
              {
                // Cannot be null
                if (obj[field][i] === null)
                {
                  return "field `" + field + "` cannot be `null`";
                }

                const res = verifyObject(obj[field][i], inner);
                if (res !== null)
                {
                  return res;
                }
              }
            }
            // Otherwise they are primitives
            else
            {
              for (let i = 0; i < obj[field].length; ++i)
              {
                if (typeof obj[field][i] !== inner)
                {
                  return "field `" + field + "` is an array, but not all contents are of type `" + inner + "`.";
                }
              }
            }
          }
          // Both the expected and actual types are not array, so recurse
          else
          {
            const res = verifyObject(obj[field], desc[field]);
            if (res !== null)
            {
              return res;
            }
          }
      break;
        
        case "undefined":
          return "missing field `" + field + "`";
          
        default:
          return "unexpected type `" + desc_ty + "`";
      }
    }
      
    return null;
  }
}