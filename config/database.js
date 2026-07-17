const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'db');

// Create the db folder if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'library.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- Schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  category TEXT,
  publisher TEXT,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  shelf_location TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  class_section TEXT,
  phone TEXT,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS borrow_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  borrow_date TEXT NOT NULL DEFAULT (date('now')),
  due_date TEXT NOT NULL,
  return_date TEXT,
  status TEXT NOT NULL DEFAULT 'borrowed', -- borrowed | returned | overdue
  fine_amount INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_borrow_status ON borrow_records(status);
CREATE INDEX IF NOT EXISTS idx_borrow_book ON borrow_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_student ON borrow_records(student_id);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS borrow_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  requested_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT,
  reject_reason TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON borrow_requests(status);
`);

// ---------- Lightweight migration for pre-existing DBs ----------
const studentCols = db.prepare("PRAGMA table_info(students)").all().map(c => c.name);
if (!studentCols.includes('password_hash')) {
  db.exec("ALTER TABLE students ADD COLUMN password_hash TEXT");
}

module.exports = db;
