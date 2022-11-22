import React, { useEffect, useState } from 'react';
import '../components/Profile.css';
import axios from "axios";
import People from '../components/People_Following';

function Following() {
  const [ followings, setFollowings ] = useState([]);

  // This function gets called once on page load
  useEffect(() => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('../components/Path.js');

    // This is turning an async call into a sync one
    (async () => {
      // Gets our followings list (list of user IDs)
      const res = await axios.post(bp.buildPath("api/customrequest"), {
        _id: ud.userId,
        Request: "Following"
      });

      // Populate a new array with the actual profiles of the people we follow
      let followingProfiles = [];
      for (const id of res.data.Result) {
        const profile = await axios.post(bp.buildPath("api/retrieveprofile"), {
          _id: id,
        });
        followingProfiles.push(profile.data);
      }

      // Set the `followings` variable to be our new array
      setFollowings(followingProfiles);
    })();
  }, []);

  return (
    <div className='main_div'>      
      <div className='header'>
        <h2>Following</h2>
      </div>
        {followings.map((person, i) => {
          console.log(person.FirstName + " " + i);
          return (
            <People 
            first={person.FirstName}
            last={person.LastName} 
            school={person.School}
            work={person.Work}
            id={person.Id} />
          );
        })}
    </div>
  )
}


export default Following