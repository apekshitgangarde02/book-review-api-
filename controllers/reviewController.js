const Review = require('../models/Review');
const Book = require('../models/Book');

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        message: 'No book found with that ID'
      });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      book: bookId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this book'
      });
    }

    const review = await Review.create({
      rating,
      comment,
      book: bookId,
      user: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'No review found with that ID'
      });
    }

    // Check if the review belongs to the user
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not authorized to update this review'
      });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'No review found with that ID'
      });
    }

    // Check if the review belongs to the user
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not authorized to delete this review'
      });
    }

    await review.remove();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};
