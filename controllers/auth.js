const asyncWrapper = require('../utilities/async-wrapper').AsyncWrapper
const jwt = require('jsonwebtoken')
const config = require('../config')

// @desc      Google callback
// @route     GET /api/v1/auth/google/callback
// @access    Public
exports.authCallback = asyncWrapper(async (req, res, next) => {
  const token = jwt.sign({ user: req.user }, config.authSecret, {
    algorithm: 'HS256',
    subject: req.user.id,
    issuer: config.tokenIssuer
  })
  res.cookie('Authorization', `Bearer ${token}`)
  res.redirect('/')
})
