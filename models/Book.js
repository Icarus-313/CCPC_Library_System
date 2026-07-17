const db = require('../config/database');

const Book = {
  all(search = '') {
    if (search) {
      const q = `%${search}%`;
      return db.prepare(
        `SELECT * FROM books
         WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? OR category LIKE ?
         ORDER BY title ASC`
      ).all(q, q, q, q);
    }
    return db.prepare('SELECT * FROM books ORDER BY title ASC').all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  },

  create(data) {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, isbn, category, publisher, total_copies, available_copies, shelf_location)
      VALUES (@title, @author, @isbn, @category, @publisher, @total_copies, @total_copies, @shelf_location)
    `);
    return stmt.run(data);
  },

  update(id, data) {
    // Adjust available_copies proportionally if total_copies changes
    const book = Book.findById(id);
    const borrowedCount = book.total_copies - book.available_copies;
    const newAvailable = Math.max(data.total_copies - borrowedCount, 0);

    const stmt = db.prepare(`
      UPDATE books SET
        title = @title, author = @author, isbn = @isbn, category = @category,
        publisher = @publisher, total_copies = @total_copies,
        available_copies = @available_copies, shelf_location = @shelf_location
      WHERE id = @id
    `);
    return stmt.run({ ...data, available_copies: newAvailable, id });
  },

  delete(id) {
    return db.prepare('DELETE FROM books WHERE id = ?').run(id);
  },

  decrementAvailable(id) {
    return db.prepare('UPDATE books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0').run(id);
  },

  incrementAvailable(id) {
    return db.prepare('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?').run(id);
  },

  stats() {
    return db.prepare(`
      SELECT
        COUNT(*) AS total_titles,
        COALESCE(SUM(total_copies), 0) AS total_copies,
        COALESCE(SUM(available_copies), 0) AS available_copies,
        COALESCE(SUM(total_copies - available_copies), 0) AS borrowed_copies
      FROM books
    `).get();
  }
};

module.exports = Book;
