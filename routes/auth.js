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
    check("email").isEmail().withMessage("Please enter a valid email."),
    body("confirmPassword")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .withMessage(
        "Password must be at least 5 characters long and be alphanumeric"
      ),
  ],
  authController.postSignup
);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.post("/new-password", authController.postNewPassword);
router.get("/reset/:token", authController.getNewPassword);

module.exports = router;
