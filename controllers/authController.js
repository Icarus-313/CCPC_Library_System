const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Student = require('../models/Student');

// ---------- Admin ----------
exports.adminLoginForm = (req, res) => {
  res.render('auth/admin-login', { title: 'Admin Login', error: null, layout: false });
};

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;
  const admin = Admin.findByUsername(username);

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.render('auth/admin-login', {
      title: 'Admin Login', error: 'Invalid username or password.', layout: false
    });
  }

  req.session.adminId = admin.id;
  req.session.adminUsername = admin.username;
  res.redirect('/');
};

exports.adminLogout = (req, res) => {
  req.session.adminId = null;
  req.session.adminUsername = null;
  res.redirect('/auth/admin/login');
};

// ---------- Student ----------
exports.studentLoginForm = (req, res) => {
  res.render('auth/student-login', { title: 'Student Login', error: null, layout: false });
};

exports.studentLogin = (req, res) => {
  const { identifier, password } = req.body;
  const student = Student.findByRollNumber(identifier) || Student.findByEmail(identifier);

  if (!student || !student.password_hash || !bcrypt.compareSync(password, student.password_hash)) {
    return res.render('auth/student-login', {
      title: 'Student Login', error: 'Invalid roll number/email or password.', layout: false
    });
  }

  req.session.studentId = student.id;
  req.session.studentName = student.name;
  res.redirect('/portal');
};

exports.studentSignupForm = (req, res) => {
  res.render('auth/student-signup', { title: 'Student Sign Up', error: null, layout: false });
};

exports.studentSignup = (req, res) => {
  const { name, roll_number, class_section, email, phone, password, confirm_password } = req.body;

  const renderError = (msg) => res.render('auth/student-signup', {
    title: 'Student Sign Up', error: msg, layout: false
  });

  if (!name || !roll_number || !password) {
    return renderError('Name, roll number, and password are required.');
  }
  if (password.length < 6) {
    return renderError('Password must be at least 6 characters.');
  }
  if (password !== confirm_password) {
    return renderError('Passwords do not match.');
  }

  const existing = Student.findByRollNumber(roll_number);
  const hash = bcrypt.hashSync(password, 10);
  let studentId;

  if (existing) {
    if (existing.password_hash) {
      return renderError('An account already exists for this roll number. Please log in instead.');
    }
    // Roll number was pre-added to the roster by the admin — claim it with a password.
    Student.setPassword(existing.id, hash);
    studentId = existing.id;
  } else {
    const result = Student.create({
      name,
      roll_number,
      class_section: class_section || null,
      phone: phone || null,
      email: email || null,
      password_hash: hash
    });
    studentId = result.lastInsertRowid;
  }

  req.session.studentId = studentId;
  req.session.studentName = name;
  res.redirect('/portal');
};

exports.studentLogout = (req, res) => {
  req.session.studentId = null;
  req.session.studentName = null;
  res.redirect('/auth/student/login');
};
