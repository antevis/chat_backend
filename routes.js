const express = require('express');
const router = express.Router();
const data = require('./data');
const utils = require('./utils');

function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
      next(err);
    }
  };
}

// Handle POST to create a new user and subsequent login
router.post('/signup', asyncHandler(async (req, res) => {
  if (req.body.username && req.body.password) {

    const pwdHash = utils.hash(req.body.password);

    await data.addUser({
      username: req.body.username,
      pwdHash
    });

    console.log(`Created user: ${req.body.username}`);
    const userData = await data.getUserByUserName(req.body.username);

    // Remove password hash from the data being returned.
    delete userData.passwordHash;
    const tokenData = {
      userId: userData.id,

      // Newly issued Tokens are valid for 1 hour.
      validThru: Date.now() + 1000 * 60 * 60,
      token: utils.createRandomSting(20)
    };

    await data.addToken(tokenData);

    // userId is also redundant and unnecessary client-side.
    delete tokenData.userId;
    userData.token = tokenData;
    res.json(userData);

  } else {
    res.status(400).json({message: 'Both username and password are required'});
  }
}));

// Handle login. POST due to sending credentials in the body (payload)
// Basically the same as above aside from user creation.
router.post('/login', asyncHandler(async (req, res) => {
  if (req.body.username && req.body.password) {
    const userData = await data.getUserByUserName(req.body.username);
    const pwdHash = utils.hash(req.body.password);

    if (pwdHash == userData.passwordHash) {
      console.log(`User login: ${userData.username}`);

      delete userData.passwordHash;
      const tokenData = {
        userId: userData.id,
        validThru: Date.now() + 1000 * 60 * 60,
        token: utils.createRandomSting(20)
      };

      await data.addToken(tokenData);
      delete tokenData.userId;
      userData.token = tokenData;
      res.json(userData);
    } else {
      res.status(403).json({message: 'Password mismatch'});
    }
  } else {
    res.status(400).json({message: 'Both username and password are required'});
  }
}));

// Message POST
router.post('/message', asyncHandler(async (req, res) => {
  if (req.body.userId && req.body.token && req.body.message) {
    const tokenData = await data.getTokenData(req.body.token);
    const userData = await data.getUserByUserId(req.body.userId);
    if (tokenData.userId == req.body.userId && tokenData.validThru > Date.now()) {
      console.log(`Message from ${userData.username}: ${req.body.message}`);

      await data.insertMessage({userId: req.body.userId, message: req.body.message});

      // Get ten latest messages from the Database
      const latestFeed = await data.getLatestMessages(10);

      // The retrieved records are sorted newest on top.
      // Sort it back so that newest at the bottom
      latestFeed.sort((a,b) => a.timeStamp - b.timeStamp);

      // Emit the feed to the clients with Socket.io.
      router.io.emit('msg', latestFeed)
      res.status(200).json({message: 'Posted'});
    } else {
      res.status(403).json({message: 'Invalid or expired token'});
    }
  } else {
    res.status(400).json({message: 'Missing requied fields'});
  }
}));

// GET messages (to display on the clients upon initial connection)
// requested once in componentDidMount() on the client 
router.get('/messages', asyncHandler(async (req, res) => {
  if (req.headers.token != 'undefined') { // WTF??
    const tokenData = await data.getTokenData(req.headers.token);
    if (tokenData.validThru > Date.now()) {
      const latestFeed = await data.getLatestMessages(10);
      latestFeed.sort((a,b) => a.timeStamp - b.timeStamp);
      res.status(200).json(latestFeed);
    } else {
      res.status(403).json({error: 'Invalid token'});
    }
  } else {
    res.status(400).json({error: 'No valid token found'});
  }
}));


module.exports = router;
