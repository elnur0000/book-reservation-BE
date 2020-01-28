const passport = require('passport')

exports.protectedRoute = (req, res, next) => {
  return passport.authenticate('jwt', { session: false })
}
