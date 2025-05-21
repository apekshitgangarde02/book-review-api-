const Book = require('../models/Book');
const Review = require('../models/Review');
const { paginateResults } = require('../utils/paginate');

exports.getAllBooks = async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'limit', 'sort'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Book.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const books = await query;

    res.status(200).json({
      status: 'success',
      results: books.length,
      data: {
        books
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: 'No book found with that ID'
      });
    }

    // Get reviews for this book with pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ book: req.params.id })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name');

    res.status(200).json({
      status: 'success',
      data: {
        book,
        reviews
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, genre, publishedYear } = req.body;

    const book = await Book.create({
      title,
      author,
      genre,
      publishedYear,
      createdBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        book
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: 'Please provide a search query'
      });
    }

    const books = await Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      status: 'success',
      results: books.length,
      data: {
        books
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};
