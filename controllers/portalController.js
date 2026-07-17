const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');
const BorrowRequest = require('../models/BorrowRequest');

exports.dashboard = (req, res) => {
  const studentId = req.session.studentId;
  BorrowRecord.refreshOverdueStatus();

  const activeLoans = BorrowRecord.activeForStudent(studentId);
  const requests = BorrowRequest.forStudent(studentId);
  const totalFines = BorrowRecord.forStudent(studentId)
    .reduce((sum, r) => sum + (r.fine_amount || 0), 0);

  res.render('portal/dashboard', {
    title: 'My Library', active: 'portal-dashboard',
    activeLoans, requests, totalFines
  });
};

exports.books = (req, res) => {
  const studentId = req.session.studentId;
  const search = req.query.q || '';
  const books = Book.all(search);

  const myPendingBookIds = BorrowRequest.forStudent(studentId)
    .filter(r => r.status === 'pending')
    .map(r => r.book_id);
  const myActiveBookIds = BorrowRecord.activeForStudent(studentId).map(r => r.book_id);

  res.render('portal/books', {
    title: 'Browse Books', active: 'portal-books',
    books, search, myPendingBookIds, myActiveBookIds
  });
};

exports.requestBook = (req, res) => {
  const studentId = req.session.studentId;
  const bookId = req.params.id;
  const book = Book.findById(bookId);

  if (!book) return res.redirect('/portal/books');
  if (BorrowRequest.hasPending(bookId, studentId)) return res.redirect('/portal/books');
  if (BorrowRecord.hasActiveLoan(bookId, studentId)) return res.redirect('/portal/books');

  BorrowRequest.create({ book_id: bookId, student_id: studentId });
  res.redirect('/portal/books');
};

exports.myLoans = (req, res) => {
  const studentId = req.session.studentId;
  const records = BorrowRecord.forStudent(studentId);
  res.render('portal/my-loans', { title: 'My Borrowing History', active: 'portal-loans', records });
};
