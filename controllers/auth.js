const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  let message = req.flash();
  let successMessage;
  let errorMessage;

  if (message.error) {
    errorMessage = message.error;
    successMessage = false;
  } else if (message.success) {
    successMessage = message.success;
    errorMessage = false;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorMessage,
    successMessage: successMessage,
  });
};

exports.postLogin = (req, res, next) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      // check if password from req.body matched
      // to do this, need to use bcrypt compare function
      if (user) {
        bcrypt
          .compare(req.body.password, user.dataValues.password)
          .then((matched) => {
            if (matched) {
              req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
              };
              req.session.isLoggedIn = true;
              req.session.save((err) => {
                req.flash("success", "Logged in successfully!");
                res.redirect("/");
              });
            } else {
              console.log("Password didnt match");
              req.flash(
                "error",
                "Invalid email or password. Please try again, or signup."
              );
              res.redirect("/login");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        // user returned null, meaning no user was found with that email
        console.log("User not found");
        req.flash(
          "error",
          "Invalid email or password. Please try again, or signup."
        );
        res.redirect("/login");
      }
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
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = false;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.confirmPassword;

  bcrypt.hash(password, 12).then((hashed) => {
    User.findOrCreate({
      where: { email: email },
      defaults: {
        name: name,
        email: email,
        password: hashed,
      },
    }).then(([user, created]) => {
      if (created) {
        user.createCart();
        req.flash("success", "User created successfully.");
        res.redirect("/login");
      } else {
        console.log("User already exists");
        req.flash("error", "Email already exists, please try again.");
        res.redirect("/signup");
      }
    });
  });
};
