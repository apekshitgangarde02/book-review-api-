const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a book title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Please provide an author name'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  genre: {
    type: String,
    required: [true, 'Please provide a genre'],
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters']
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Published year must be at least 1000'],
    max: [new Date().getFullYear(), `Published year cannot be in the future`]
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better search performance
bookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', bookSchema);
