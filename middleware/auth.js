const BorrowRequest = require('../models/BorrowRequest');

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return res.redirect('/auth/admin/login');
  }
  res.locals.pendingRequestCount = BorrowRequest.pendingCount();
  next();
}

function requireStudent(req, res, next) {
  if (!req.session || !req.session.studentId) {
    return res.redirect('/auth/student/login');
  }
  next();
}

module.exports = { requireAdmin, requireStudent };
