const path = require("path");

const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const { routeAuth } = require("../middleware/isAuth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", routeAuth, adminController.getAddProduct);
// /admin/add-product => POST
router.post(
  "/add-product",
  routeAuth,
  [
    body("title")
      .not()
      .isEmpty()
      .withMessage("You must add a title for your product")
      .isLength({ min: 5, max: 255 })
      .withMessage("Your title needs to be between 5 and 255 characters.")
      .trim()
      .escape(),
    body("imageUrl")
      .isLength({ min: 0, max: 255 })
      .withMessage("Your image url is too long")
      .trim(),
    body("description")
      .not()
      .isEmpty()
      .withMessage("You must add a description for your product.")
      .isLength({ min: 5, max: 255 })
      .withMessage(
        "Please add a desctription that is between 5 and 255 characters."
      ),
    body("price").isNumeric().withMessage("Your price must be a number."),
  ],

  adminController.postAddProduct
);

// /admin/products => GET
router.get("/products", routeAuth, adminController.getProducts);

router.get(
  "/edit-product/:productId",
  routeAuth,
  adminController.getEditProduct
);
router.post(
  "/edit-product/:productId",
  routeAuth,
  [
    body("title")
      .not()
      .isEmpty()
      .withMessage("You must add a title for your product")
      .isLength({ min: 5, max: 255 })
      .withMessage("Your title needs to be between 5 and 255 characters.")
      .trim()
      .escape(),
    body("imageUrl")
      .isLength({ min: 0, max: 255 })
      .withMessage("Your image url is too long")
      .trim(),
    body("description")
      .not()
      .isEmpty()
      .withMessage("You must add a description for your product.")
      .isLength({ min: 5, max: 255 })
      .withMessage(
        "Please add a desctription that is between 5 and 255 characters."
      ),
    body("price").isNumeric().withMessage("Your price must be a number."),
  ],
  adminController.postEditProduct
);

router.post("/delete-product/", routeAuth, adminController.deleteProduct);

module.exports = router;
