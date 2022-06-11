require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const mongoose = require("mongoose")
const { redirect } = require("express/lib/response")
const md5 = require("md5")
const port = 3000

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + '/public'))

app.set("view engine", "ejs")


mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})


const User = mongoose.model("User", userSchema)




app.get("/home", (req, res)=>{
    res.render("home")
})


app.get("/login", (req, res)=>{

    res.render("login")
})

app.post("/login", (req, res) => {
  User.findOne({ username: req.body.username }, (err, userInfo) => {
    if (userInfo) {
      if (userInfo.password === md5( req.body.password)) {
        console.log(userInfo);
        res.render("secrets");
      } else {
        res.send("Invalid Password.");
      }
    } else {
      res.send("Invalid User");
    }
  });
});

app.get("/register", (req, res)=>{
    res.render("register")
})

app.post("/register", (req, res)=>{
    console.log(req.body);
   const username= req.body.username
    const password= md5(req.body.password) 

    const user = new User({
        username: username,
        password: password
    })

    user.save(err=>{
        if (err) {
           console.log("error occured"); 
        } else {
            console.log("User is Successfully Registered.");
            res.redirect("/home")
        }
    })


    
})

app.get("/secrets", (req, res)=>{
    res.render("secrets")
})

app.get("/submit", (req, res)=>{
    res.render("submit")
})

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);
})