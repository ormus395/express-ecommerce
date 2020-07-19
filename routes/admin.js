const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");
const { routeAuth } = require("../middleware/isAuth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", routeAuth, adminController.getAddProduct);
// /admin/add-product => POST
router.post("/add-product", routeAuth, adminController.postAddProduct);

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
  adminController.postEditProduct
);

router.post("/delete-product/", routeAuth, adminController.deleteProduct);

module.exports = router;
