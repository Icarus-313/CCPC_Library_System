const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const Student = require('../models/Student');
const BorrowRequest = require('../models/BorrowRequest');

exports.index = (req, res) => {
  BorrowRecord.refreshOverdueStatus();
  const active = BorrowRecord.allActive();
  res.render('borrow/index', { active, title: 'Active Borrows' });
};

exports.history = (req, res) => {
  const search = req.query.q || '';
  const records = BorrowRecord.allHistory(search);
  res.render('borrow/history', { records, search, title: 'Borrow History' });
};

exports.issueForm = (req, res) => {
  const books = Book.all().filter(b => b.available_copies > 0);
  const students = Student.all();
  res.render('borrow/issue', { books, students, title: 'Issue Book', error: null });
};

exports.issue = (req, res) => {
  const { book_id, student_id, loan_days } = req.body;

  const book = Book.findById(book_id);
  if (!book || book.available_copies < 1) {
    const books = Book.all().filter(b => b.available_copies > 0);
    const students = Student.all();
    return res.render('borrow/issue', {
      books, students, title: 'Issue Book',
      error: 'This book has no available copies right now.'
    });
  }

  if (BorrowRecord.hasActiveLoan(book_id, student_id)) {
    const books = Book.all().filter(b => b.available_copies > 0);
    const students = Student.all();
    return res.render('borrow/issue', {
      books, students, title: 'Issue Book',
      error: 'This student already has an active loan for this book.'
    });
  }

  BorrowRecord.create({ book_id, student_id, loan_days });
  Book.decrementAvailable(book_id);
  res.redirect('/borrow');
};

exports.return = (req, res) => {
  const record = BorrowRecord.findById(req.params.id);
  if (!record) return res.status(404).send('Record not found');

  BorrowRecord.markReturned(req.params.id);
  Book.incrementAvailable(record.book_id);
  res.redirect('/borrow');
};

exports.requests = (req, res) => {
  const pending = BorrowRequest.allPending();
  let errorMsg = null;
  if (req.query.error === 'no_copies') {
    errorMsg = 'No copies are available to approve this request. Reject it, or wait until a copy is returned.';
  }
  res.render('borrow/requests', { pending, title: 'Borrow Requests', errorMsg });
};

exports.approveRequest = (req, res) => {
  const request = BorrowRequest.findById(req.params.id);
  if (!request || request.status !== 'pending') return res.redirect('/borrow/requests');

  const book = Book.findById(request.book_id);
  if (!book || book.available_copies < 1) {
    return res.redirect('/borrow/requests?error=no_copies');
  }

  if (BorrowRecord.hasActiveLoan(request.book_id, request.student_id)) {
    BorrowRequest.reject(request.id, 'Student already has this book on loan.');
    return res.redirect('/borrow/requests');
  }

  BorrowRecord.create({ book_id: request.book_id, student_id: request.student_id });
  Book.decrementAvailable(request.book_id);
  BorrowRequest.approve(request.id);
  res.redirect('/borrow/requests');
};

exports.rejectRequest = (req, res) => {
  BorrowRequest.reject(req.params.id, req.body.reason || 'Not approved');
  res.redirect('/borrow/requests');
};
