require('express');
require('mongodb');
const token = require("./createJWT.js");

exports.setApp = function ( app, client )
{
  app.post('/api/addcard', async (req, res, next) =>
  {
    // incoming: userId, color
    // outgoing: error
    
    // Verify input
    const obj = req.body;
    let err = verifyObject(
      obj,
      {
        userId: "string",
        card: "string",
        jwtToken: "string"
      }
    );

    if (err !== null) {
      let ret = { Error: err };
      res.status(200).json(ret);
      return;
    }

    // Verify token
    try
    {
      if (token.isExpired(obj.jwtToken))
      {
        throw "Token is expired";
      }
    }
    catch (e)
    {
      let ret = { Error: e.toString() };
      res.status(200).json(ret);
      return;
    }

    const newCard = {Card: obj.card, UserId: obj.userId};
    let refreshedToken = null;

    try
    {
      const db = client.db("SocialNetwork");
      const result = db.collection('Test').insertOne(newCard);
      refreshedToken = token.refresh(obj.jwtToken);
    }
    catch(e)
    {
      err = e.toString();
    }
  
    const ret = { Error: err, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });
  

  app.post('/api/login', async (req, res, next) => 
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

    var ret ;
  
    if (err !== null && err !== undefined)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }
  
    // Find the user
    try 
    {
      const db = client.db("SocialNetwork");
      results = await db
        .collection('Users')
        .find({Login: obj.Login, Password: obj.Password})
        .toArray();
    } 
    catch(e) 
    {
      err = e.toString();
    }

    try
    {
      var ret = token.createToken(results[0].FirstName, results[0].LastName, results[0]._id);      
    }
    catch(e)
    {
      err = e.toString();
    }
  
    if (err !== null && err !== undefined)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }
  
    // Check if it exists
    if (results.length === 0)
    {
      var ret = { Error: "bad username or password" };
      res.status(200).json(ret);
      return;
    }
  
    //var ret = 
    //{ 
    //  Id: results[0]._id, 
    //  FirstName: results[0].FirstName, 
    //  LastName: results[0].LastName, 
    //  Error: err
    //};
    res.status(200).json(ret);
  });
  

  app.post('/api/register', async (req, res, next) => 
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
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }
  
    if (obj.Login.length === 0) 
    {
      err = "login is empty";
    }
  
    if (obj.Password.length === 0) 
    {
      err = "password is empty";
    }
  
    if (obj.FirstName.length === 0) 
    {
      err = "first name is empty";
    }
  
    if (obj.LastName.length === 0) 
    {
      err = "last name is empty";
    }
  
    if (err !== null)
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }
  
    // Verify a user with the same login doesn't already exist
    let db;
    try 
    {
      db = client.db("SocialNetwork");
      results = await db.collection('Users').find({Login:obj.Login}).toArray();
  
      if (results.length !== 0) 
      {
        err = "user with existing login already exists";
      }
    } catch(e) 
    {
      err = e.toString();
    }
  
    if (err !== null) 
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }
  
    // Construct new user and add it to the database
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
  
    try 
    {
      db.collection('Users').insertOne(newUser);
    } 
    catch(e) 
    {
      err = e.toString();
    }
  
    var ret = { Error: err };
    res.status(200).json(ret);
  });
  

  app.post('/api/searchcards', async (req, res, next) => 
  {
    // incoming: userId, search
    // outgoing: results[], error
  
    // Verify input
    const obj = req.body;
    let err = verifyObject(
      obj,
      {
        userId: "string",
        search: "string",
        jwtToken: "string"
      }
    );

    if (err !== null) 
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }

    // Verify token hasn't expired
    try
    {
      if (token.isExpired(obj.jwtToken))
      {
        err = "JWT token is expired";
      }
    }
    catch (e)
    {
      err = e.toString();
    }

    if (err !== null) 
    {
      var ret = { Error: err };
      res.status(200).json(ret);
      return;
    }

    var _search = obj.search.trim();
    
    const db = client.db("SocialNetwork");
    const results = await db.collection('Test').find({"Card":{$regex:_search+'.*', $options:'r'}}).toArray();
    let refreshedToken = null;

    try
    {
      refreshedToken = token.refresh(obj.jwtToken);
    }
    catch(e)
    {
      err = e.toString();
    }
  
    var _ret = [];
    for( var i=0; i<results.length; i++ )
    {
      _ret.push( results[i].Card );
    }
    
    var ret = {results:_ret, Error: err, jwtToken: refreshedToken};
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