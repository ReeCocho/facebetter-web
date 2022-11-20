import React, { useState } from "react";
import AWS from 'aws-sdk';

const s3  = new AWS.S3({
  accessKeyId: process.env.REACT_APP_BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

const test = process.env.REACT_APP_BUCKETEER_BUCKET_NAME;

function UploadFile(props) {

  let ud = JSON.parse(localStorage.getItem('user_data'));
  let userId = ud.userId;
  console.log(ud);

  const [fileData, setFileData] = useState({});

  const doFileUpload = event => {
    var files = document.getElementById('fileUpload').files;
    if (files) {
      let file = files[0];
      let fileName = file.name;
      let filePath = `public/${userId}/${fileName}`;
      let fileUrl = 'https://' + 'facebetter.s3.amazonaws.com/' +  filePath;
  
      let params = {
        Key: filePath,
        Body: file,
        Bucket: process.env.REACT_APP_BUCKETEER_BUCKET_NAME,
      };
  
      s3.upload(params, function put(err, data) {
        if (err) {
          throw err;
        }
        setFileData({data, fileUrl});
        props?.onComplete({data, fileUrl});
        console.log(`File uploaded successfully. ${data.Location}` );
      });
    }
  }

  console.log(fileData);

  return (
    <div>
      <div>
        <p>Upload File</p>           
        <input type="file" id="fileUpload"/>    
      </div>    
      <div> 
        <button onClick={doFileUpload}>Submit</button>    
      </div>
      <div>
        <img src={fileData.fileUrl}></img>
      </div>
    </div>
  );
};




export default UploadFile;