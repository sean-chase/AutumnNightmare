const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use('/maps', express.static('maps'));

// TODO: in memory for dev/testing, haven't decided on a database yet. Probably Mongo
var instances = {};

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
    instance = instance || `${name}-${map}`
    if (!instances[instance]) {
      // TODO
      instances[instance] = {
        players: {}
      };
    }

    if (!instances[instance].players[name]) {
      instances[instance].players[name] = {
        name: name,
        //location: { x: 0, y: 0, z: 0, direction: 'N' }
        socketid: socket.id
      };
    }

    socket.instance = instance;
    socket.player = instances[instance].players[name];
    socket.join(instance);
    socket.emit('join-complete', { map: map, instance: instance });

    io.to(instance).emit('message', { type: 'notification', time: new Date(), from: 'Server', text: `${name} has joined the game.` });
    io.to(instance).emit('update-players', instances[instance].players);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected');
    let instance = instances[socket.instance];
    if (instance) {
      if (socket.player) {
        io.to(socket.instance).emit('message', { type: 'notification', time: new Date(), from: 'Server', text: `${socket.player.name} has left the game.` });
      }
      io.to(socket.instance).emit("update-players", instance.players);
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