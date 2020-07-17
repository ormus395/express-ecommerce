const User = require("../models/user");
const { response } = require("express");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  console.log(req.session.user);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.save((err) => {
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  }
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.confirmPassword;

  User.findOrCreate({
    where: { email: email },
    defaults: {
      name: name,
      email: email,
      password: password,
    },
  }).then(([user, created]) => {
    if (created) {
      console.log("Created");
      res.redirect("/login");
    } else {
      console.log("User already exists");
      res.redirect("/signup");
    }
  });
};
