//import React from 'react';

function UploadFile() {
  const AWS = require('aws-sdk');
  const s3  = new AWS.S3({
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
  });

  let bucket = process.env.BUCKETEER_BUCKET_NAME;

  const doFileUpload = event => {
    var files = document.getElementById('fileUpload').files;
    if (files) {
      let file = files[0];
      let fileName = file.name;
      let filePath = 'userName/' + fileName;
      let fileUrl = 'https://' + 'facebetter.s3.amazonaws.com/public/' +  filePath;
  
      let params = {
        Key: filePath,
        Body: file,
        Bucket: bucket,
      };
  
      s3.putObject(params, function put(err, data) {
        if (err) {
          throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}` );
      });
    }
  }

  return (
    <div>
      <div>
        <p>Upload Profile Photo</p>           
        <input type="file" id="fileUpload"/>    
      </div>    
      <div> 
        <button onClick={doFileUpload}>Submit</button>    
      </div>
    </div>
  );
};




export default UploadFile;