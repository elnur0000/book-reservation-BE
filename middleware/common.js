const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')

module.exports = function CommonMiddleware (app) {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common'))
  app.use(cors())
  app.use(mongoSanitize())
  app.use(helmet())
  app.use(xss())
  app.use(rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
  }))
}
