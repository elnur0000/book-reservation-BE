const GoogleStrategy = require('passport-google-oauth20')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractStrategy = require('passport-jwt').ExtractJwt
const config = require('../config')

module.exports = function AuthMiddleware (app) {
  // jwt strategy
  passport.use(new JwtStrategy({
    secretOrKey: config.authSecret,
    algorithms: ['HS256'],
    issuer: config.tokenIssuer,
    ignoreExpiration: false,
    jwtFromRequest: ExtractStrategy.fromAuthHeaderWithScheme('Bearer') // Authorization: Bearer <TOKEN>
  }, async (payload, done) => {
    const id = payload.sub

    if (id) {
      done(null, payload.user)
    } else {
      done(null, false)
    }
  }))

  // google strategy
  passport.use(new GoogleStrategy({
    clientID: config.googleAuth.clientId,
    clientSecret: config.googleAuth.clientSecret,
    callbackURL: `${config.host}/api/v1/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    done(null, {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      photo: profile.photos[0].value
    })
  }
  ))

  app.use(passport.initialize()) // Used to initialize passport
}
