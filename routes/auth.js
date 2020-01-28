const router = require('express').Router()
const passport = require('passport')
const { authCallback } = require('../controllers/auth')

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', { session: false }), authCallback)

module.exports = router
