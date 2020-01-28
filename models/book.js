const mongoose = require('mongoose')
const Joi = require('joi')

const BookSchema = new mongoose.Schema(
  {
    currentOwner: {
      type: String
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Please add an author'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true
    },
    img: {
      type: String,
      required: [true, 'Please add an image']
    },
    nextOwner: {
      type: String
    }

  }
)

module.exports = {
  Book: mongoose.model('Book', BookSchema),
  BookValidationSchema: Joi.object().keys({
    name: Joi.string().required(),
    author: Joi.string().required(),
    description: Joi.string().required()
  })
}
