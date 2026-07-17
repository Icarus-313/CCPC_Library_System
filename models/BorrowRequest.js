const db = require('../config/database');

const BorrowRequest = {
  create({ book_id, student_id }) {
    return db.prepare('INSERT INTO borrow_requests (book_id, student_id) VALUES (?, ?)').run(book_id, student_id);
  },

  hasPending(book_id, student_id) {
    return db.prepare(`
      SELECT COUNT(*) AS c FROM borrow_requests
      WHERE book_id = ? AND student_id = ? AND status = 'pending'
    `).get(book_id, student_id).c > 0;
  },

  allPending() {
    return db.prepare(`
      SELECT r.*, b.title AS book_title, b.author AS book_author, b.available_copies,
             s.name AS student_name, s.roll_number
      FROM borrow_requests r
      JOIN books b ON b.id = r.book_id
      JOIN students s ON s.id = r.student_id
      WHERE r.status = 'pending'
      ORDER BY r.requested_at ASC
    `).all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM borrow_requests WHERE id = ?').get(id);
  },

  approve(id) {
    return db.prepare(`
      UPDATE borrow_requests SET status = 'approved', resolved_at = datetime('now') WHERE id = ?
    `).run(id);
  },

  reject(id, reason) {
    return db.prepare(`
      UPDATE borrow_requests SET status = 'rejected', resolved_at = datetime('now'), reject_reason = ? WHERE id = ?
    `).run(reason || null, id);
  },

  forStudent(student_id) {
    return db.prepare(`
      SELECT r.*, b.title AS book_title, b.author AS book_author
      FROM borrow_requests r
      JOIN books b ON b.id = r.book_id
      WHERE r.student_id = ?
      ORDER BY r.requested_at DESC
    `).all(student_id);
  },

  pendingCount() {
    return db.prepare(`SELECT COUNT(*) AS c FROM borrow_requests WHERE status = 'pending'`).get().c;
  }
};

module.exports = BorrowRequest;
