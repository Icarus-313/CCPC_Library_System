const db = require('../config/database');

const FINE_PER_DAY = 5; // currency units per day overdue
const DEFAULT_LOAN_DAYS = 14;

const BorrowRecord = {
  allActive() {
    return db.prepare(`
      SELECT br.*, b.title AS book_title, b.author AS book_author,
             s.name AS student_name, s.roll_number
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      JOIN students s ON s.id = br.student_id
      WHERE br.status IN ('borrowed', 'overdue')
      ORDER BY br.due_date ASC
    `).all();
  },

  allHistory(search = '') {
    if (search) {
      const q = `%${search}%`;
      return db.prepare(`
        SELECT br.*, b.title AS book_title, b.author AS book_author,
               s.name AS student_name, s.roll_number
        FROM borrow_records br
        JOIN books b ON b.id = br.book_id
        JOIN students s ON s.id = br.student_id
        WHERE b.title LIKE ? OR s.name LIKE ? OR s.roll_number LIKE ?
        ORDER BY br.borrow_date DESC
      `).all(q, q, q);
    }
    return db.prepare(`
      SELECT br.*, b.title AS book_title, b.author AS book_author,
             s.name AS student_name, s.roll_number
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      JOIN students s ON s.id = br.student_id
      ORDER BY br.borrow_date DESC
    `).all();
  },

  findById(id) {
    return db.prepare(`
      SELECT br.*, b.title AS book_title, b.author AS book_author,
             s.name AS student_name, s.roll_number
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      JOIN students s ON s.id = br.student_id
      WHERE br.id = ?
    `).get(id);
  },

  // Returns true if the student already has this exact book borrowed (not yet returned)
  hasActiveLoan(bookId, studentId) {
    return db.prepare(`
      SELECT COUNT(*) AS c FROM borrow_records
      WHERE book_id = ? AND student_id = ? AND status IN ('borrowed', 'overdue')
    `).get(bookId, studentId).c > 0;
  },

  create({ book_id, student_id, loan_days }) {
    const days = loan_days && Number(loan_days) > 0 ? Number(loan_days) : DEFAULT_LOAN_DAYS;
    const stmt = db.prepare(`
      INSERT INTO borrow_records (book_id, student_id, borrow_date, due_date, status)
      VALUES (?, ?, date('now'), date('now', '+' || ? || ' days'), 'borrowed')
    `);
    return stmt.run(book_id, student_id, days);
  },

  markReturned(id) {
    const record = BorrowRecord.findById(id);
    if (!record) return null;

    // Calculate fine if overdue
    const today = new Date();
    const due = new Date(record.due_date);
    const diffDays = Math.floor((today - due) / (1000 * 60 * 60 * 24));
    const fine = diffDays > 0 ? diffDays * FINE_PER_DAY : 0;

    const stmt = db.prepare(`
      UPDATE borrow_records
      SET status = 'returned', return_date = date('now'), fine_amount = ?
      WHERE id = ?
    `);
    return stmt.run(fine, id);
  },

  forStudent(student_id) {
    return db.prepare(`
      SELECT br.*, b.title AS book_title, b.author AS book_author
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      WHERE br.student_id = ?
      ORDER BY br.borrow_date DESC
    `).all(student_id);
  },

  activeForStudent(student_id) {
    return db.prepare(`
      SELECT br.*, b.title AS book_title, b.author AS book_author
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      WHERE br.student_id = ? AND br.status IN ('borrowed', 'overdue')
      ORDER BY br.due_date ASC
    `).all(student_id);
  },

  // Sweep: mark any active loans past due_date as 'overdue'
  refreshOverdueStatus() {
    db.prepare(`
      UPDATE borrow_records
      SET status = 'overdue'
      WHERE status = 'borrowed' AND due_date < date('now')
    `).run();
  },

  stats() {
    BorrowRecord.refreshOverdueStatus();
    return db.prepare(`
      SELECT
        SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) AS currently_borrowed,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_count,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS returned_count
      FROM borrow_records
    `).get();
  }
};

module.exports = BorrowRecord;
