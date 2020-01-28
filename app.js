const express = require('express')
const Middleware = require('./middleware/middleware')
const ErrorHandlingMiddleware = require('./middleware/error-handling')
const connectDB = require('./config/db')
const AuthenticationMiddleware = require('./middleware/auth')

// Connect to database if it's not a test environment
if (process.env.NODE_ENV !== 'test') connectDB()
const app = express()

// routes
const books = require('./routes/books')
const auth = require('./routes/auth')

Middleware(app)
AuthenticationMiddleware(app)

app.use('/api/v1/books', books)
app.use('/api/v1/auth', auth)

ErrorHandlingMiddleware(app)

module.exports = app
