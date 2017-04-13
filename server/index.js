const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const cors = require('cors');
const GameInstance = require('./gameInstance.js');

app.use(cors());
app.use('/maps', express.static(__dirname + "/maps"));

// TODO: in memory for dev/testing, haven't decided on a database yet. Probably Mongo
var instances = {};
var gameData = {};

app.get('/maplist', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  // TODO: read from maps directory
  res.send(JSON.stringify([{ text: 'Development Test Map', value: 'testmap' }]));
});

app.get('/instancelist', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let results = [];
  for (var key in instances) {
    results.push({ text: key, value: key });
  }
  res.send(JSON.stringify(results));
});

io.on('connection', (socket) => {
  socket.on("join", (name, map, instance) => {
    // Create a new instance if they are not joining an existing one.
    instance = instance || `${name}-${map}`;

    let gameInstance = instances[instance];

    if (!gameInstance) {
      gameData[map] = require(`./maps/${map}/data.json`);
      gameInstance = instances[instance] = new GameInstance(instance, gameData[map].clientGameData, io);
    }

    // Add the player if it's not already added to the instance
    if (!gameInstance.gameState.players[name]) {
      gameInstance.gameState.players[name] = {
        name: name,
        location: gameInstance.gameState.startLocation,
        socketid: socket.id
      };
    }

    socket.instance = instance;
    socket.player = gameInstance.gameState.players[name];
    socket.join(instance);
    socket.emit('join-complete', { map: map, instance: instance });

    io.to(instance).emit('message', { type: 'notification', time: new Date(), from: 'Server', text: `${name} has joined the game.` });
    io.to(instance).emit('update-game-state', gameInstance.gameState);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected');
    let instance = instances[socket.instance];
    if (instance) {
      if (socket.player) {
        io.to(socket.instance).emit('message', { type: 'notification', time: new Date(), from: 'Server', text: `${socket.player.name} has left the game.` });
      }
    }
  });

  socket.on('add-message', (message) => {
    console.log(message);
    io.to(socket.instance).emit('message', message);
  });
});

http.listen(3000, () => {
  console.log('listening on port:3000');
});