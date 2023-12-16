const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const highland = require('highland');
const request = require('request');

const app = express();
app.use(cors());

const server = http.createServer(app);
const filePath = 'server/Cost_centers.csv';

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  const stream = highland(fs.createReadStream(filePath));
  let count = 0;
  socket.on('loadFile', (data) => {
    const {url} = data;
    const through = highland.pipeline(s => {

      let headStream;
      let headers = [];

      s = s
        .split()
        .compact()
        .map((row) => {
          count++;
          return row.split(',');
        });

      headStream = s.observe();
      s.pause();
      s = s
        .drop(1)
        .map((row) => {
          const obj = headers.reduce((obj, key, i) => {
            obj[key] = row[i].toUpperCase();

            return obj;
          }, {});
          socket.emit('fileData', obj)
        });

      headStream.head().toArray((rows) => {
        headers = rows[0];
        socket.emit('headers', headers);
        s.resume();
      });
      return s;
    })

    highland(request.get(url))
      .pipe(through)
      .errors((err) => {
        socket.emit('fileError', err.message);
      })
      .done(() => {
        socket.emit('fileEnd', count);
      });
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON ${PORT} PORT`);
});