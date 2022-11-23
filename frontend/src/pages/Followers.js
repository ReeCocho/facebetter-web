import React, { useEffect, useState } from 'react';
import '../components/Profile.css';
import axios from "axios";
import People from '../components/People_Followers';

function Followers() {
  // This variable (followers) is stateful. It hangs around between rerenders of the page. Using
  // `setFollowers` will change the contents of the `followers` variable and trigger a rerender.
  // Do NOT manually modify the `followers` variable. Only use the `setFollowers` function. The
  // value passed to the `useState` function is the initial value of `followers`. 
  const [ followers, setFollowers ] = useState([]);

  // This function gets called once on page load
  useEffect(() => {
    let ud = JSON.parse(localStorage.getItem('user_data'));
    var bp = require('../components/Path.js');

    // This is turning an async call into a sync one
    (async () => {
      // Gets our followers list (list of user IDs)
      const res = await axios.post(bp.buildPath("api/customrequest"), {
        _id: ud.userId,
        Request: "Followers"
      });

      // Populate a new array with the actual profiles of our followers
      let followerProfiles = [];
      for (const id of res.data.Result) {
        const profile = await axios.post(bp.buildPath("api/retrieveprofile"), {
          _id: id,
        });
        followerProfiles.push(profile.data);
      }

      // Set the `followers` variable to be our new array
      setFollowers(followerProfiles);
    })();
  }, []);

  return (
    <div className='main_div'>      
      <div className='header'>
        <h2>Followers</h2>
      </div>
        {followers.map((person, i) => {
          console.log(person.FirstName + " " + i);
          return (
            <People 
            first={person.FirstName}
            last={person.LastName} 
            school={person.School}
            work={person.Work} />
          );
        })}
    </div>
  )
}


export default Followers;