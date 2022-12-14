const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const ws = require("ws");

const PORT = process.env.PORT || 5000; //5000 for web
const app = express();
app.set("port", process.env.PORT || 5000); //5000 for web
app.use(cors());
app.use(bodyParser.json());

const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
client.connect();

const AWS = require('aws-sdk');
const s3  = new AWS.S3({
  accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

const server = app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});

const wss = new ws.Server({ server: server });

var api = require("./api.js");
api.setApp(app, wss, client);

// For Heroku deployment

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("frontend/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

module.exports = { app, client, server, wss, s3 };
