require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }))

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, (err)=>{
    if (err) {
      console.log("Unable to login due to some error.");
    } else {
      passport.authenticate("local")(req,res, ()=>{
        res.redirect("/secrets")
      })
    }
  })
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res)=>{
  if(req.isAuthenticated()){
    res.render("secrets")
  }
  else{
    res.redirect("/login")
  }
})

app.post("/register", (req, res) => {
  
  User.register({username: req.body.username}, req.body.password, (err, user)=> {
    if (err) {
      console.log("error in registering the user.");
      console.log(err);
      res.redirect("/register");
    }
    else if(user){
      passport.authenticate("local")(req,res, ()=>{
        res.redirect("secrets")
      })
    }

  
  })
  
});

app.get("/secrets", (req, res) => {
  res.render("secrets");
});

app.get("/submit", (req, res) => {
  res.render("submit");
});

app.get("/logout", (req, res)=>{
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/home");
  });
})




app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
