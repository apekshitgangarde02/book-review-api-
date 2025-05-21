const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: [true, 'Review must belong to a book']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate reviews from the same user for the same book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Calculate average rating on book when a review is saved
reviewSchema.statics.calcAverageRating = async function(bookId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookId }
    },
    {
      $group: {
        _id: '$book',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Book').findByIdAndUpdate(bookId, {
      averageRating: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  } else {
    await mongoose.model('Book').findByIdAndUpdate(bookId, {
      averageRating: 0,
      ratingsQuantity: 0
    });
  }
};

// Update book's average rating when a review is updated or deleted
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.book);
});

reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.book);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
