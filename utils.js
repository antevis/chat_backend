const crypto = require('crypto');

const hashingSecret = 'superSecret';

const utils = {};

// Basic Password hashing
utils.hash = str => {
  if (typeof(str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', hashingSecret)
      .update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
}

// Used to generate tokens.
utils.createRandomSting = len => {
  len = (typeof(len) == 'number' && len > 0) ? len : false;

  if (len){
    let alphaset = 'abcdefjhijklmnopqrstuvwxyz1234567890';
    var result = '';

    while (result.length < len) {
      result += alphaset.charAt(Math.floor(Math.random()*alphaset.length));
    }
    return result;
  }
  return len;
}

module.exports = utils;
