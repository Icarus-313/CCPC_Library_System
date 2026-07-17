const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/', bookController.index);
router.get('/new', bookController.newForm);
router.post('/', bookController.create);
router.get('/:id/edit', bookController.editForm);
router.put('/:id', bookController.update);
router.delete('/:id', bookController.delete);

module.exports = router;
