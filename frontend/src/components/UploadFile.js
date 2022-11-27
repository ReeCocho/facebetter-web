import React, { useState, useRef } from 'react';
import AWS from 'aws-sdk';

const s3  = new AWS.S3({
  accessKeyId: process.env.REACT_APP_BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

function UploadFile(props) {

  let ud = JSON.parse(localStorage.getItem('user_data'));
  let userId = ud.userId;
  const ref = useRef()


  const [fileData, setFileData] = useState({});

  const doFileUpload = event => {
    var files = document.getElementById('fileUpload').files;
    if (files) {
      let file = files[0];
      let fileName = file.name;
      let filePath = `public/${userId}/${fileName}`;
      let fileUrl = 'https://facebetter.s3.amazonaws.com/' +  filePath;
  
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
        props?.onComplete?.({data, fileUrl});
        console.log(`File uploaded successfully. ${data.Location}` );
      });
    }
  }

  const handleClick = (e) => {
    ref.current.click()
    
  }

  console.log(fileData);

  let picLink = localStorage.getItem("profile_pic_link");

  return (
    <div>
      <div>
        {/* <input type="file" id="fileUpload" onInput={doFileUpload}/>  */}
        <input ref={ref} type="file" id="fileUpload" onInput={doFileUpload} style={{display:"none"}}/>
        <img src={picLink} alt="" className="profile_picture" onClick={handleClick}></img>
        {/* <input ref={ref} type="file" id="fileUpload" onInput={doFileUpload}/> */}
      </div>    
      {/* <div>
        <img src={fileData.fileUrl} alt="" id="upload_picture"></img>
      </div> */}
    </div>
  );
};




export default UploadFile;