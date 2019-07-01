/*
 * Library for data manipulation
 *
 */
const path = require('path');
const sqlite = require('sqlite3').verbose();

const dbFile = path.join(__dirname, './demo.db');

const lib = {};

const db = new sqlite.Database(dbFile, sqlite.OPEN_READWRITE, err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database');
  }
});

lib.addUser = data => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO users(username, passwordHash) VALUES(?,?)`,
      [data.username, data.pwdHash], err => {
        if (err) {
          reject(err);
        } else {
          resolve()
        }
      });
  });
}

lib.getUserByUserName = username => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id, username, passwordHash FROM users WHERE username = ?`,
      username, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
  });
}

lib.getUserByUserId = userId => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id, username, passwordHash FROM users WHERE id = ?`,
      userId, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
  });
}

lib.addToken = data => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO tokens(userId, validThru, token) VALUES (?,?,?)`,
      [data.userId, data.validThru, data.token], err => {
        if (err) {
          reject(err);
        } else {
          resolve()
        }
      });
  });
}

lib.getTokenForUser = userId => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id, userId, validThru, token FROM tokens WHERE userId = ? AND validThru > ?`,
      [userId, Date.now()], (err, data) => {
        if (err) {
          reject(err);
        } else {
          const json = JSON.parse(data);
          resolve(json);
        }
      });
  });
}

lib.getTokenData = token => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id, userId, validThru, token FROM tokens WHERE token = ?`,
      token, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
  });
}

lib.addUser = data => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO users(username, passwordHash) VALUES(?,?)`,
      [data.username, data.pwdHash], err => {
        if (err) {
          reject(err);
        } else {
          resolve()
        }
      });
  });
}

lib.insertMessage = data => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO chat(userId, timeStamp, message) VALUES(?,?,?)`,
      [data.userId, Date.now(), data.message], err => {
        if (err) {
          reject(err);
        } else {
          resolve()
        }
    });
  })
}

lib.getLatestMessages = n => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT chat.id, chat.message, chat.timeStamp, users.username
      FROM chat LEFT JOIN users ON users.id = chat.userId
      ORDER BY chat.timeStamp DESC LIMIT ${n}`;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}


module.exports = lib;
