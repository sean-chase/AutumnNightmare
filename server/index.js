const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const cors = require('cors')

app.use(cors());
app.use('/mock', express.static('mock'))

var players = {};  

io.on('connection', (socket) => {
  //console.log(socket);
  //io.emit('message', { type: 'notification', time: new Date(), from: 'Server', text: 'A user connected...who knows??...' }); 

  socket.on("join", (name) => {
     if(players[name]) {
       // Someone dropped and reconnected, so give them back their state data
        players[socket.id] = players[name];
     }
     else {
        players[socket.id] = {
            name: name,
            location: { x: 0, y: 0, z: 0, direction: 'N' }
        };
     }

      io.emit('message', { type: 'notification', time: new Date(), from: 'Server', text: `${name} has joined the game.` });
      io.emit("update-players", players);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('message', { type: 'notification', time: new Date(), from: 'Server', text: `${players[socket.id]} has left the game.` });
    io.emit("update-players", players);
  });

  socket.on('add-message', (message) => {
    console.log(message);
    io.emit('message', message);    
  });

  // socket.on("send", (msg) => {
  //     io.emit("chat", players[socket.id], msg);
  // });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});