const { ObjectId } = require('mongodb');

require('express');
require('mongodb');
const token = require("./createJWT.js");
const mailer = require("./emailConfirmation.js");

exports.setApp = function ( app, client )
{
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

    let e = mailer.sendEmail(1, "nzljdviwqbpqertvwr@tmmbt.com");
    if(e !== null)
    {
      console.log(e.toString());
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
        Following: [],
        School: obj.School,
        Work: obj.Work
      };

      db.collection('Users').insertOne(newUser);

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

      // Find our current follower list
      results = await db
        .collection('Users')
        .find({ _id: ObjectId(obj._id) })
        .toArray();

      if (results.length === 0)
      {
        throw "Bad user ID";
      }

      let following = results[0].Following;

      // Check if we're already following this user
      // NOTE: Consider adding elements in their sorted position so we can use binary search to
      // search for users.
      for (let i = 0; i < following.length; i++)
      {
        if (ObjectId(following[i]).equals(toFollowId))
        {
          throw "Already following.";
        }
      }

      // Add the new follower
      following.push(toFollowId);
      await db
        .collection('Users')
        .updateOne(
          { _id: ObjectId(obj._id) }, 
          { $set: { Following: following } }
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

  app.post('/api/retrieveprofile', async (req, res, next) => {
    // incoming: _id (ex: {_id: "6344e4ea7c568d2a25ed0f6f"})
    // outgoing: {FirstName: 'John', LastName: 'Doe', Following: ['uuid1', 'uuid2', ...], School: 'UCF', Work: 'Disney'} 
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
      FirstName: results[0].FirstName, 
      LastName: results[0].LastName, 
      Following: results[0].Following,
      School: results[0].School,
      Work: results[0].Work,
      Error: err
    };
    res.status(200).json(ret);
  });
  
  // requires ALL fields to be sent
  // send original/old info for things not to be updated,
  // send updated text for things to be updated
  app.post('/api/editprofile', async (req, res, next) => {
    // incoming: {_id: "6344e4ea7c568d2a25ed0f6f", FirstName: "NewFirst", LastName: "NewLast", ...}
    // outgoing: {err: "error message"}
    const obj = req.body;

    let err = verifyObject(obj, {
      _id: "string",
      FirstName: "string", 
      LastName: "string", 
      School: "string", 
      Work: "string"
    });
  
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
      let newFirstName = obj.FirstName;
      let newLastName = obj.LastName;
      let newSchool = obj.School;
      let newWork = obj.Work;

      let filter = {_id: objId}
      let updates = {
        FirstName: newFirstName,
        LastName: newLastName,
        School: newSchool,
        Work: newWork
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
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }

    // if there are no matches, that means we cannot find a user with that ID
    if (results.matchedCount === 0)
    {
      var ret = { Error: "cannot find user with that ID" };
      res.status(200).json(ret);
      return;
    }
  
    var ret = {Error: null};
    res.status(200).json(ret);
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