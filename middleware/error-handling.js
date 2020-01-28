const ValidationError = require('../errors').ValidationError
const AuthenticationError = require('../errors').AuthenticationError
const AccessDeniedError = require('../errors').AccessDeniedError

function errorLogger (err, req, res, next) {
  if (err.message) {
    console.log(err.message)
  }
  if (err.stack) {
    console.log(err.message)
  }
  next(err)
}

function authenticationErrorHandler (err, req, res, next) {
  if (err instanceof AuthenticationError) {
    return res.sendStatus(401).send({ error: { message: err.message } })
  }
  next(err)
}

function validationErrorHandler (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).send({ error: { message: err.message } })
  }
  next(err)
}

function accessDeniedErrorHandler (err, req, res, next) {
  if (err instanceof AccessDeniedError) {
    return res.sendStatus(403).send({ error: { message: err.message } })
  }
  next(err)
}

function genericErrorHandler (err, req, res, next) {
  res.sendStatus(500)
  next(err)
}

module.exports = function ErrorHandlingMiddleware (app) {
  app.use([
    errorLogger,
    authenticationErrorHandler,
    validationErrorHandler,
    accessDeniedErrorHandler,
    genericErrorHandler
  ])
}
