const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.index);
router.get('/new', studentController.newForm);
router.post('/', studentController.create);
router.get('/:id/edit', studentController.editForm);
router.put('/:id', studentController.update);
router.delete('/:id', studentController.delete);

module.exports = router;
