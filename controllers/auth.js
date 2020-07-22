const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator/check");

const sgMail = require("../util/mailer");
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
  } else {
    errorMessage = false;
    successMessage = false;
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
    errors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.confirmPassword;
  const error = validationResult(req);
  let message;

  console.log(error);
  if (!error.isEmpty()) {
    message = error.errors[0].msg;
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: message,
      successMessage: false,
      errors: error.errors,
    });
  }
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
        const msg = {
          to: user.email,
          from: "jarecturner@gmail.com",
          subject: "Thanks for joining NodeCommerce!",
          html: `<strong>We hope you enjoy using our ecommerce platform ${user.name}!</strong>`,
        };

        sgMail.send(msg).then(
          () => {},
          (error) => {
            console.log(error);
          }
        );
        res.redirect("/login");
      } else {
        console.log("User already exists");
        req.flash("error", "Email already exists, please try again.");
        res.redirect("/signup");
      }
    });
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash();
  let successMessage;
  let errorMessage;

  console.log(message);

  if (message.error) {
    errorMessage = message.error;
    successMessage = false;
  } else if (message.success) {
    successMessage = message.success;
    errorMessage = false;
  } else {
    successMessage = false;
    errorMessage = false;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: errorMessage,
    successMessage: successMessage,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      req.flash("error", "There was a problem resetting the password.");
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");
    const tokenExp = Date.now() + 3600000;

    User.findOne({
      where: { email: req.body.email },
    })
      .then((user) => {
        if (!user) {
          req.flash("error", "Unable to reset the password.");
          return res.redirect("/reset");
        }
        user.passwordResetToken = token;
        user.tokenExp = tokenExp;
        return user.save();
      })
      .then((response) => {
        if (response) {
          const msg = {
            to: response.email,
            from: "jarecturner@gmail.com",
            subject: "Password reset",
            html: `
            <p>You requested a password reset</p>
            <p>Clck this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
            `,
          };

          sgMail.send(msg).then(
            () => {},
            (error) => {
              console.log(error);
            }
          );
          res.redirect("/login");
        }
      })
      .catch((err) => {
        console.log(err);
        req.flash("error", "There was an issue resetting the password.");
        res.redirect("/reset");
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  let message = req.flash();
  let successMessage;
  let errorMessage;

  if (message.error) {
    errorMessage = message.error;
    successMessage = false;
  } else if (message.success) {
    successMessage = message.success;
    errorMessage = false;
  } else {
    errorMessage = false;
    successMessage = false;
  }

  const token = req.params.token;

  User.findOne({
    where: {
      passwordResetToken: token,
      tokenExp: { [Op.gt]: Date.now() },
    },
  })
    .then((user) => {
      if (!user) {
        req.flash(
          "error",
          "The token for that link no longer exists, or has expired."
        );
        return res.redirect("/reset");
      }
      res.render("auth/new-password", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: errorMessage,
        successMessage: successMessage,
        userId: user.id,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const password = req.body.confirmPassword;
  bcrypt.hash(password, 12).then((hashed) => {
    User.findOne({
      where: { id: req.body.id },
    })
      .then((user) => {
        if (!user) {
          req.flash("error", "Error in resetting password.");
          return res.redirec("/reset");
        }
        user.password = hashed;
        user.token = null;
        user.tokenExp = null;
        return user.save();
      })
      .then((response) => {
        if (response) {
          req.flash("success", "Password reset successfully.");
          res.redirect("/login");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
