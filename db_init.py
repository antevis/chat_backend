# Database initialization script

import sqlite3

conn = sqlite3.connect('./demo.db')
c = conn.cursor()
c.execute('''CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE, passwordHash TEXT)''')

c.execute('''CREATE TABLE chat(id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER, timeStamp INTEGER, message TEXT,
    FOREIGN KEY(userId) REFERENCES users(id))''')

c.execute('''CREATE TABLE tokens(id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER, validThru INTEGER, token TEXT,
    FOREIGN KEY(userId) REFERENCES users(id))''')

conn.commit()
conn.close()
