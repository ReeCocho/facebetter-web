// MongoDB
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://root:rootpassword@cluster0.dei1plb.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(url);
client.connect();

// WebSocket
const ws = require('ws');
const webSocketsServerPort = 8000;
const wss = new ws.WebSocketServer({ port: webSocketsServerPort });

const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};

wss.on('connection', function connection(ws, req) {
    const id = getUniqueID();
    ws.id = id;
});

// Website
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => 
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.post('/api/sendMessage', async (req, res, next) =>
{
  // incoming: userId, color
  // outgoing: error
  var error = '';
  const newMessage = {
    message: req.body
  };
  
  try {
    // Send message to the database
    const db = client.db("ChatTest");
    const results = await db
      .collection("Chat")
      .insertOne(newMessage);

    // Notify every client that a message has been sent
    wss.clients.forEach((client) => {
        const data = JSON.stringify({message: newMessage.message});
        client.send(data);
    });

  } catch(e) {
    error = e.toString();
  }

  var ret = { error: error };
  res.status(200).json(ret);
});

app.listen(5000);