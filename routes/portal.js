const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { requireStudent } = require('../middleware/auth');

router.use(requireStudent);
router.use((req, res, next) => {
  res.locals.layout = 'partials/portal-layout';
  next();
});

router.get('/', portalController.dashboard);
router.get('/books', portalController.books);
router.post('/books/:id/request', portalController.requestBook);
router.get('/my-loans', portalController.myLoans);

module.exports = router;
