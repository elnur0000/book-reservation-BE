const fs = require('fs')
const mongoose = require('mongoose')
const config = require('./config')
const books = require('./_data/books')

// Load env vars
// Load models
const { Book } = require('./models/book')

// Connect to DB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

// // Read JSON files
// const books = JSON.parse(
//   fs.readFileSync(`${__dirname}/_data/books.json`, 'utf-8')
// )

// Import into DB
const importData = async () => {
  try {
    await Book.create(books)
    console.log('Data Imported...')
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

// Delete data
const deleteData = async () => {
  try {
    await Book.deleteMany().exec()
    console.log('Data Destroyed...')
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

if (process.argv[2] === '-i') {
  importData()
} else if (process.argv[2] === '-d') {
  deleteData()
}
