require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook')
const findOrCreate = require('mongoose-findorcreate')
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())

const db_url = process.env.DB_URL || 'mongodb://localhost:27017/userDB'

mongoose.connect(db_url)

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  secret: String,
  googleId: String,
  facebookId: String
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = mongoose.model('User', userSchema)

passport.use(User.createStrategy())

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username })
  })
})

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user)
  })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/secrets',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile)
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user)
      })
    }
  )
)

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:3000/auth/facebook/secrets'
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile)
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user)
      })
    }
  )
)

app.get('/', (req, res) => {
  res.redirect('/home')
})

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
)

app.get(
  '/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets')
  }
)

app.get('/auth/facebook', passport.authenticate('facebook'))

app.get(
  '/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets')
  }
)

app.get('/home', (req, res) => {
  res.render('home')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, (err) => {
    if (err) {
      console.log('Unable to login due to some error.')
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets')
      })
    }
  })
})

app.get('/register', (req, res) => {
  res.render('register')
})

// app.get("/secrets", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.render("secrets")
//   } else {
//     res.redirect("/login")
//   }
// })

app.post('/register', (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log('error in registering the user.')
        console.log(err)
        res.redirect('/register')
      } else if (user) {
        passport.authenticate('local')(req, res, () => {
          res.redirect('secrets')
        })
      }
    }
  )
})

app.get('/secrets', (req, res) => {
  User.find({ secrets: { $ne: null } }, (err, foundUsers) => {
    if (err) {
      console.log(err)
    } else {
      if (foundUsers) {
        res.render('secrets', { usersWithSecrets: foundUsers })
      }
    }
  })
})

app.get('/submit', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('submit')
  } else {
    res.redirect('/login')
  }
})

app.post('/submit', (req, res) => {
  // console.log(req.body.secret, req.user.id)

  User.findById(req.user.id, (err, foundUser) => {
    if (err) {
      console.log(err)
    } else {
      if (foundUser) {
        foundUser.secret = req.body.secret
        foundUser.save().then(res.redirect('/secrets'))
      } else {
      }
    }
  })
})

app.get('/logout', (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err)
    res.redirect('/home')
  })
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})
