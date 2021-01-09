require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user");
var jwt = require("jsonwebtoken");
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err));

//Middlewares
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Hackathon Mongo Backend",
  });
});

app.get("/register", (req, res) => {
  const { aadhar } = req.query;
  var data = require("./data.json");
  User.findOne({ aadhar: aadhar }).then((savedUser) => {
    if (savedUser) {
      var token = jwt.sign({ aadhar }, process.env.JWT_ACC_KEY);
      const user = new User({
        name: savedUser.name,
        email: savedUser.email,
        aadhar: savedUser.aadhar,
        phone: savedUser.phone,
        city: savedUser.city,
        gender: savedUser.gender,
        _id: savedUser._id,
        token: token,
      });
      User.findOneAndUpdate({ aadhar: aadhar }, user, (err, user) => {
        if (err) {
          return res
            .status(400)
            .json({ err: "Error in signup while account activation" });
        } else {
          res.json({
            name: user.name,
            email: user.email,
            aadhar: user.aadhar,
            token: token,
            phone: user.phone,
            city: user.city,
            gender: user.gender,
          });
        }
      });
    } else {
      var token = jwt.sign({ aadhar }, process.env.JWT_ACC_KEY);
      var dd = data.find((item) => item.aadhar == aadhar);
      const user = new User({
        name: dd.name,
        email: dd.email,
        aadhar: dd.aadhar,
        phone: dd.phone,
        city: dd.city,
        gender: dd.gender,
        token: token,
      });
      console.log(user);
      user.save((err, user) => {
        if (err) {
          return res
            .status(400)
            .json({ err: "Error in signup while account activation" });
        }
        res.json({
          name: user.name,
          email: user.email,
          aadhar: user.aadhar,
          token: user.token,
          phone: user.phone,
          city: user.city,
          gender: user.gender,
        });
      });
    }
  });
});

app.get("/logout", (req, res) => {
  const { aadhar } = req.query;
  User.findOne({ aadhar: aadhar }).then((savedUser) => {
    if (!savedUser) {
      return res.status(400).json({ error: "User Not found" });
    }
    const user = new User({
      name: savedUser.name,
      email: savedUser.email,
      aadhar: savedUser.aadhar,
      phone: savedUser.phone,
      token: "",
      city: savedUser.city,
      gender: savedUser.gender,
      _id: savedUser._id,
    });
    User.findOneAndUpdate({ aadhar: aadhar }, user, (err, user) => {
      if (err) {
        return res
          .status(400)
          .json({ err: "Error in signup while account activation" });
      } else {
        res.json({
          name: user.name,
          email: user.email,
          aadhar: user.aadhar,
          phone: user.phone,
          city: user.city,
          gender: user.gender,
        });
      }
    });
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("index.js"));
}

const port = process.env.PORT || 8080;

app.listen(port, () => console.log("Server is running"));
