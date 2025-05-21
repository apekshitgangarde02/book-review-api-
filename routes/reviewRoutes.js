const express = require('express');
const reviewController = require('../controllers/reviewController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.use(auth.protect);

router.post('/books/:id/reviews', reviewController.createReview);
router.put('/reviews/:id', reviewController.updateReview);
router.delete('/reviews/:id', reviewController.deleteReview);

module.exports = router;
