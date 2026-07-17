const db = require('../config/database');

const Admin = {
  findByUsername(username) {
    return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  },

  count() {
    return db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
  },

  create({ username, password_hash }) {
    return db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, password_hash);
  }
};

module.exports = Admin;
