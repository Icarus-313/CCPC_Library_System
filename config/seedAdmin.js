const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

function seedAdmin() {
  if (Admin.count() > 0) return;

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(password, 10);

  Admin.create({ username, password_hash: hash });

  console.log('----------------------------------------------------');
  console.log('No admin account found — created a default one:');
  console.log(`  username: ${username}`);
  console.log(`  password: ${password}`);
  console.log('Log in and note this down. Set ADMIN_USERNAME / ADMIN_PASSWORD');
  console.log('env vars before first run to choose your own instead.');
  console.log('----------------------------------------------------');
}

module.exports = seedAdmin;
