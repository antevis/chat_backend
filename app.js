const express = require('express');
const data = require('./data');
const routes = require('./routes');

// To enable CORS.
// Otherwise it's basically non-functional
const cors = require('cors');

const utils = require('./utils');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// To enable emitting events from within the router.
routes.io = io;

app.use(cors())
app.use(express.json());
app.use('/api', routes);

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error-handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({error: {message: err.message}});
});


http.listen(3000, () => console.log('Chat API listening on *:3000'));
