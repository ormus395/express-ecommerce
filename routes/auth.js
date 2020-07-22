const express = require("express");
const router = express.Router();
const { check } = require("express-validator/check");
const { body } = require("express-validator");

const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .isAlphanumeric()
      .withMessage("Password must be alphanumeric.")
      .trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      } else {
        return true;
      }
    }),
  ],
  authController.postSignup
);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.post("/new-password", authController.postNewPassword);
router.get("/reset/:token", authController.getNewPassword);

module.exports = router;
