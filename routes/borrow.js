const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

router.get('/', borrowController.index);
router.get('/history', borrowController.history);
router.get('/requests', borrowController.requests);
router.post('/requests/:id/approve', borrowController.approveRequest);
router.post('/requests/:id/reject', borrowController.rejectRequest);
router.get('/issue', borrowController.issueForm);
router.post('/issue', borrowController.issue);
router.post('/:id/return', borrowController.return);

module.exports = router;
