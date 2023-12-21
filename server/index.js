const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const highland = require('highland');
const request = require('request');
const parse = require('csv-parser');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const transformRow = (row) => {
  for (let key in row) {
    row[key] = row[key].toUpperCase()
  }
  return row;
};

io.on('connection', (socket) => {
  let count = 0;
  socket.on('loadFile', (data) => {
    const { url } = data;

    const parseCSV = () => {
      return highland((push, next) => {
        request.get(url)
          .pipe(parse())
          .on('data', (data) => {
            push(null, data)
          })
          .on('headers', (headers) => {
            socket.emit('headers', headers);
          })
          .on('end', () => push(null, highland.nil))
          .on('error', (error) => push(error));
      })
    }

    parseCSV()
      .map((row) => {
        return transformRow(row);
      })
      .collect()
      .toCallback((err, rows) => {
        if (err) {
          socket.emit('fileError', err.message);
          return;
        }
        
        socket.emit('fileData', rows);
        socket.emit('fileEnd', rows.length);
      });
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON ${PORT} PORT`);
});