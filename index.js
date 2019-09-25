const express = require('express')
const passport = require('passport')
const morgan = require('morgan')
const OAuth2Strategy = require('passport-oauth2').Strategy

// Please retrieve and set keys from Azure Portal
const AUTH_KEYS = {
  SECRET: "Please set key",
  // Note: Please set callback URL in Azure Portal too
  CALLBACK_URL: "http://localhost:3000/auth/example/callback",
  CLIENT_ID: "Please set key",
  TENANT_ID: "Please set key"
}

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: `https://login.microsoftonline.com/${AUTH_KEYS.TENANT_ID}/oauth2/authorize`,
      tokenURL: `https://login.microsoftonline.com/${AUTH_KEYS.TENANT_ID}/oauth2/token`,
      clientID: "57d1dfe9-7b6f-49e9-85b6-730496f13253",
      clientSecret: AUTH_KEYS.SECRET,
      callbackURL: AUTH_KEYS.CALLBACK_URL
    },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, {
        accessToken: accessToken
      })
      // User.findOrCreate({ exampleId: profile.id }, (err, user) => {
      //   return cb(err, user)
      // })
    }
  )
)

passport.serializeUser((user, done) => {
  console.log("passport.serializeUser:", user)
  done(null, user)
})

passport.deserializeUser((user, done) => {
  console.log("passport.deserializeUser:", user)
  done(null, user)
})

// Session handler
const sessionCheck = (req, res, next) => {
  console.log("sessionCheck:", req.session.passport)
  if (req.session.passport) {
    next()
  } else {
    res.redirect('/auth/example')
  }
}

// Create a new Express application
const app = express()
app.use(morgan('combined')) // logger
app.use(
  require('body-parser').urlencoded({ extended: true })
);
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

// Initialize Passport and restore authentication state
app.use(passport.initialize())
app.use(passport.session())

// Define routes
app.get('/',
  (req, res) => {
    res.send("hello")
  }
)

app.get('/logout',
  (req, res) => {
    req.logout()
    res.redirect('/')
  }
)

app.get('/secret',
  sessionCheck,
  (req, res) => {
    res.send("hello secret")
  }
)

app.get('/auth/example',
  passport.authenticate('oauth2')
)

app.get('/auth/example/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home
    res.redirect('/secret')
  }
)

app.listen(3000, () => {
  console.log("Start server")
})
