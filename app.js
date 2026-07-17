const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

require('./config/seedAdmin')();

const Book = require('./models/Book');
const Student = require('./models/Student');
const BorrowRecord = require('./models/BorrowRecord');
const BorrowRequest = require('./models/BorrowRequest');

const { requireAdmin } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const portalRoutes = require('./routes/portal');
const bookRoutes = require('./routes/books');
const studentRoutes = require('./routes/students');
const borrowRoutes = require('./routes/borrow');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'partials/layout');

// ---------- Middleware ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'ccpc-library-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Shared identity locals available to every view
app.use((req, res, next) => {
  res.locals.active = null;
  res.locals.isAdmin = !!req.session.adminId;
  res.locals.isStudent = !!req.session.studentId;
  res.locals.adminUsername = req.session.adminUsername || null;
  res.locals.studentName = req.session.studentName || null;
  next();
});

// ---------- Public entry point ----------
app.get('/', (req, res) => {
  if (req.session.adminId) {
    BorrowRecord.refreshOverdueStatus();
    return res.render('dashboard', {
      title: 'Dashboard',
      active: 'dashboard',
      bookStats: Book.stats(),
      borrowStats: BorrowRecord.stats(),
      studentCount: Student.count(),
      pendingRequestCount: BorrowRequest.pendingCount()
    });
  }
  if (req.session.studentId) {
    return res.redirect('/portal');
  }
  res.render('landing', { title: 'Welcome', layout: false });
});

app.use('/auth', authRoutes);
app.use('/portal', portalRoutes);

// ---------- Admin-only routes ----------
app.use('/books', requireAdmin, (req, res, next) => { res.locals.active = 'books'; next(); }, bookRoutes);
app.use('/students', requireAdmin, (req, res, next) => { res.locals.active = 'students'; next(); }, studentRoutes);
app.use('/borrow', requireAdmin, (req, res, next) => {
  if (req.path.startsWith('/history')) res.locals.active = 'history';
  else if (req.path.startsWith('/requests')) res.locals.active = 'requests';
  else res.locals.active = 'borrow';
  next();
}, borrowRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`CCPC Library system running at http://localhost:${PORT}`);
});
