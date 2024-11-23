const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
// const { check, validationResult } = require("express-validator");
// const path = require("path");
// const { Sequelize, DataTypes } = require("sequelize");
// const nodemailer = require("nodemailer");
const helpers = require("./helpers/helpers");
const userModel = require("./models/user");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

console.log(userModel.User);

app.use(
  session({
    secret: "supersecret",
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
  })
);

//Setting up database connection

const testDbConnection = async () => {
  try {
    await userModel.sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

testDbConnection();

//Routes

app.get("/", (req, res) => {
  res.redirect("/login");
});

//Login routes

app.get("/login", (req, res) => {
  if (req.session.Authenticated === true) res.redirect("/profile");
  else res.render("login.ejs", { message: "" });
});

app.post("/login", async (req, res) => {
  loggingUser = {
    email: req.body.email,
    password: req.body.password,
  };

  const isRegistered = await helpers.checkEmail(loggingUser.email);

  if (!isRegistered) {
    res.render("login.ejs", { message: "This email is not registered." });
  } else {
    if (
      loggingUser.password === (await helpers.getPassword(loggingUser.email))
    ) {
      const query = await userModel.User.findAll({
        where: {
          email: loggingUser.email,
        },
      });

      req.session.Authenticated = true;
      req.session.user = query[0].dataValues;

      res.redirect("/profile");
    } else res.render("login.ejs", { message: "Wrong password." });
  }
});

//Register routes

app.get("/register", (req, res) => {
  if (req.session.Authenticated === true) res.redirect("/profile");
  else res.render("register.ejs", { message: "" });
});

app.post("/register", async (req, res) => {
  user = {
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
    age: req.body.age,
    email: req.body.email,
    password: req.body.password,
  };

  const isValid = !(await helpers.checkEmail(user.email));

  if (!isValid) {
    res.render("register.ejs", {
      message: "This email is already registered.",
    });
  } else if (!helpers.checkPassword(user.password)) {
    res.render("register.ejs", {
      message: "Password has to be at least 8 characters.",
    });
  } else {
    userModel.User.create({
      email: user.email,
      name: user.name,
      address: user.address,
      phone: user.phone,
      age: user.age,
      password: user.password,
    });
    res.render("register.ejs", {
      message: "You've been registered succesfully.",
    });
  }
});

//Profile routes

app.get("/profile", (req, res) => {
  if (!req.session.Authenticated) res.redirect("/login");
  else res.render("profile.ejs", { userProfile: req.session.user, message: "" });
});

app.post("/profile", async (req, res) => {
  if (!req.session.Authenticated) res.redirect("/login");
  else {
    updatedUser = {
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      age: req.body.age,
      email: req.body.email,
      password: req.body.password,
    };

    if (!req.body.password) {
      updatedUser.password = req.session.user.password;
    }

    const isValid = !(await helpers.checkEmail(updatedUser.email));

    if (!isValid && updatedUser.email != req.session.user.email) {
      res.render("profile.ejs", {
        user: req.session.user,
        message: "This email is already registered.",
      });
    } else if (!helpers.checkPassword(updatedUser.password)) {
      res.render("profile.ejs", {
        user: req.session.user,
        message: "Password has to be at least 8 characters.",
      });
    } else {
      await userModel.User.update(
        {
          email: updatedUser.email,
          name: updatedUser.name,
          address: updatedUser.address,
          phone: updatedUser.phone,
          age: updatedUser.age,
          password: updatedUser.password,
        },
        {
          where: {
            email: req.session.user.email,
          },
        }
      );
      req.session.user = updatedUser;
      res.render("profile.ejs", {
        user: req.session.user,
        message: "Info has been updated succesfully",
      });
    }
  }
});

//Logout route

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to destroy session");
    }
    res.redirect("/"); // Redirect to home page after session is destroyed
  });
});

app.listen(3000, function () {
  console.log("Express App running at http://localhost:3000/");
});
