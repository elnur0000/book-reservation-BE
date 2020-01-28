const express = require('express')
const {
  getBooks,
  createBook,
  reservateBook,
  becomeOwner,
  unown
} = require('../controllers/books')
const { validator } = require('../middleware/validator')
const { protectedRoute } = require('../middleware/protected-route')
const { upload } = require('../middleware/multer')

const router = express.Router()

router.use(protectedRoute())

router
  .route('/')
  .get(getBooks)
  .post(upload.single('img'), validator('Book'), createBook)

router.put('/:id/reservate', reservateBook)
router.put('/:id/own', becomeOwner)
router.put('/:id/unown', unown)

module.exports = router
