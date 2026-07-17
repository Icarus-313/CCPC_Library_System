const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/admin/login', authController.adminLoginForm);
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.adminLogout);

router.get('/student/login', authController.studentLoginForm);
router.post('/student/login', authController.studentLogin);
router.get('/student/signup', authController.studentSignupForm);
router.post('/student/signup', authController.studentSignup);
router.post('/student/logout', authController.studentLogout);

module.exports = router;
