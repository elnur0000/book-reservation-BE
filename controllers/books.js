const asyncWrapper = require('../utilities/async-wrapper').AsyncWrapper
const { Book } = require('../models/book')
const cloudinaryService = require('../services/cloudinary')
const { ValidationError } = require('../errors')

// @desc      Get books
// @route     GET /api/v1/books
// @access    Private
exports.getBooks = asyncWrapper(async (req, res, next) => {
  const books = await Book.find().exec()
  res.send(books)
})

// @desc      Post book
// @route     POST /api/v1/books
// @access    Private
exports.createBook = asyncWrapper(async (req, res, next) => {
  if (!req.file) throw new ValidationError('image is required')
  const { url } = await cloudinaryService.uploadImage(req.file.path)
  const book = new Book({ img: url, ...req.body })
  res.send(await Book.create(book))
})

// @desc Become owner of the book
// @route Put /api/v1/books/:id/own
// @access Private
exports.becomeOwner = asyncWrapper(async (req, res, next) => {
  const bookId = req.params.id
  const book = await Book.findOne({ _id: bookId }).exec()
  if (book.currentOwner) throw new ValidationError('the book already has an owner')
  if (book.nextOwner) {
    if (book.nextOwner === req.user.id) {
      book.nextOwner = null
      book.currentOwner = req.user.id
      return res.send(await book.save())
    }
    throw new ValidationError('the book is reservated by somebody else')
  }
  book.currentOwner = req.user.id
  res.send(await book.save())
})

// @desc Unown the book
// @route Put /api/v1/books/:id/unown
// @access Private
exports.unown = asyncWrapper(async (req, res, next) => {
  const bookId = req.params.id
  const book = await Book.findOne({ _id: bookId, currentOwner: req.user.id }).exec()
  if (!book) throw new ValidationError('the book is owned by somebody else')
  book.currentOwner = null
  res.send(await book.save())
})

// @desc Book reservation
// @route Put /api/v1/books/:id/reservate
// @access Private
exports.reservateBook = asyncWrapper(async (req, res, next) => {
  const bookId = req.params.id
  const book = await Book.findOne({ _id: bookId }).exec()
  if (!book || book.nextOwner) throw new ValidationError("the book doesn't exist or it's already reservated")
  book.nextOwner = req.user.id
  res.send(await book.save())
})
