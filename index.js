require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const mongoose = require("mongoose")
<<<<<<< Updated upstream
const encrypt = require("mongoose-encryption")
const { redirect } = require("express/lib/response")
=======
const bcrypt = require('bcrypt');
const saltRounds = 10;
>>>>>>> Stashed changes
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

userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']});

const User = mongoose.model("User", userSchema)




app.get("/home", (req, res)=>{
    res.render("home")
})


app.get("/login", (req, res)=>{

    res.render("login")
})

app.post("/login", (req, res) => {
  User.findOne({ username: req.body.username }, (error, userInfo) => {
    if (userInfo) {
<<<<<<< Updated upstream
      if (userInfo.password === req.body.password) {
        console.log(userInfo);
        res.render("secrets");
      } else {
        res.send("Invalid Password.");
      }
=======
      bcrypt.compare(
        req.body.password,
        userInfo.password,
        function (err, result) {
          // result == true
          if (result) {
            res.render("secrets");
          }
          else if (err) {
            console.log("error.");
          } else {
            res.send("Wrong Password.");
          }
        }
      );
>>>>>>> Stashed changes
    } else {
      console.log("Invalid User");
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
    const password= req.body.password

<<<<<<< Updated upstream
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
=======
    bcrypt.hash(password, saltRounds, function(err, hash) {
        // Store hash in your password DB.

        const user = new User({
            username: username,
            password: hash
        })
    
        user.save(err=>{
            if (err) {
               console.log("error occured"); 
            } else {
                console.log("User is Successfully Registered.");
                res.redirect("/home")
            }
        })
    
    });
>>>>>>> Stashed changes

   

    
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