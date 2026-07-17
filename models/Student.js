const db = require('../config/database');

const Student = {
  all(search = '') {
    if (search) {
      const q = `%${search}%`;
      return db.prepare(
        `SELECT * FROM students
         WHERE name LIKE ? OR roll_number LIKE ? OR class_section LIKE ?
         ORDER BY name ASC`
      ).all(q, q, q);
    }
    return db.prepare('SELECT * FROM students ORDER BY name ASC').all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  },

  findByRollNumber(roll_number) {
    return db.prepare('SELECT * FROM students WHERE roll_number = ?').get(roll_number);
  },

  findByEmail(email) {
    if (!email) return null;
    return db.prepare('SELECT * FROM students WHERE email = ?').get(email);
  },

  setPassword(id, password_hash) {
    return db.prepare('UPDATE students SET password_hash = ? WHERE id = ?').run(password_hash, id);
  },

  create(data) {
    const stmt = db.prepare(`
      INSERT INTO students (name, roll_number, class_section, phone, email, password_hash)
      VALUES (@name, @roll_number, @class_section, @phone, @email, @password_hash)
    `);
    return stmt.run({ password_hash: null, ...data });
  },

  update(id, data) {
    const stmt = db.prepare(`
      UPDATE students SET
        name = @name, roll_number = @roll_number, class_section = @class_section,
        phone = @phone, email = @email
      WHERE id = @id
    `);
    return stmt.run({ ...data, id });
  },

  delete(id) {
    return db.prepare('DELETE FROM students WHERE id = ?').run(id);
  },

  count() {
    return db.prepare('SELECT COUNT(*) AS count FROM students').get().count;
  }
};

module.exports = Student;
