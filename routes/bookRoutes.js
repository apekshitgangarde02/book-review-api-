const express = require('express');
const bookController = require('../controllers/bookController');
const auth = require('../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(bookController.getAllBooks)
  .post(auth.protect, bookController.createBook);

router.get('/search', bookController.searchBooks);

router.get('/:id', bookController.getBook);

module.exports = router;
