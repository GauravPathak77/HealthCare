require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static("public"));
app.use(express.json());

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch(()=>{
    console.log("Failed to connect MongoDB", err);
})

const dataSchema = new mongoose.Schema({
    id: Number,
    username: String,
    email: String,
    password: String
});

const User = mongoose.model("User", dataSchema);

app.get("/", (req,res)=>{
    res.sendFile(__dirname+"/index.html");
});
// register
app.post("/register", (req,res)=>{
    const {username, email, password} = req.body;
    const newUser = new User({username, email, password});

    User.findOne({username}).then(user=>{
        if(user!=null && username == user.username){
            if(password == user.password){
                console.log("Already registered");
                res.send("Already registered try Login");
            }
            else{
                console.log("Wrong Password");
                res.send("Wrong Password<br><a href='/updatepass'>Forget Password</a>");
            }
        }
        else{
            newUser
              .save()
              .then(() => {
                console.log("Registration Successful");
                res.send("Registration Successful");
              })
              .catch((err) => {
                console.log("Failed to register user", err);
                res.send("Failed to register user");
              });
        }
    });
});

// Login
app.post("/login", (req,res)=>{
    const {username, password} = req.body;

    User.findOne({username, password}).then((user)=>{
        if(user){
            console.log("Login successful");
            res.send('Login successful');
        }
        else{
            console.log("Failed to login");
            res.send("Failed to logins");
        }
    }).catch(err =>{
        console.log('Error during login', err);
        res.send("Error during login", err);
    })
})

// forget password
app.get("/updatepass", (req,res)=>{
    res.send(`<form action='/updatepass' method='post'>
    <input type="text" name="username" placeholder="Enter username" required/>
    <input type='password' name='newPassword' placeholder='Enter New Password' required/>
    <button type='submit'>Update</button>
    </form>`);
});
app.post("/updatepass", (req,res)=>{
    const {username,newPassword} = req.body;
    User.findOneAndUpdate(
      { username },
      { $set: {password: newPassword } },
      { new: true }
    )
      .then(result => {
        if (result) {
          console.log("Password Updated");
          res.sendFile(__dirname + "/index.html");
        } else {
          console.log("Invalid username");
          res.send("Invalid username");
        }
      })
      .catch((err) => {
        console.log("Password update failed ", err);
        res.send("Password update failed ", err);
      }); 
});


app.listen(process.env.PORT,() => {
    console.log("Connected to port 3000");
})
