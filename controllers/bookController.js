const Book = require('../models/Book');

exports.index = (req, res) => {
  const search = req.query.q || '';
  const books = Book.all(search);
  res.render('books/index', { books, search, title: 'Books' });
};

exports.newForm = (req, res) => {
  res.render('books/form', { book: null, title: 'Add Book' });
};

exports.create = (req, res) => {
  const { title, author, isbn, category, publisher, total_copies, shelf_location } = req.body;
  Book.create({
    title,
    author,
    isbn: isbn || null,
    category: category || null,
    publisher: publisher || null,
    total_copies: parseInt(total_copies, 10) || 1,
    shelf_location: shelf_location || null
  });
  res.redirect('/books');
};

exports.editForm = (req, res) => {
  const book = Book.findById(req.params.id);
  if (!book) return res.status(404).send('Book not found');
  res.render('books/form', { book, title: 'Edit Book' });
};

exports.update = (req, res) => {
  const { title, author, isbn, category, publisher, total_copies, shelf_location } = req.body;
  Book.update(req.params.id, {
    title,
    author,
    isbn: isbn || null,
    category: category || null,
    publisher: publisher || null,
    total_copies: parseInt(total_copies, 10) || 1,
    shelf_location: shelf_location || null
  });
  res.redirect('/books');
};

exports.delete = (req, res) => {
  Book.delete(req.params.id);
  res.redirect('/books');
};
