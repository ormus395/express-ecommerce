const path = require("path");

const express = require("express");
const { body } = require("express-validator");

const shopController = require("../controllers/shop");
const { routeAuth } = require("../middleware/isAuth");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", routeAuth, shopController.getCart);
router.post("/cart", routeAuth, shopController.postCart);

router.post("/cart-delete-item", routeAuth, shopController.deleteFromCart);

router.get("/orders", routeAuth, shopController.getOrders);
router.post("/create-order", routeAuth, shopController.postOrder);

router.get("/orders/:orderId", routeAuth, shopController.getInvoice);

router.get("/checkout", routeAuth, shopController.getCheckout);
router.get("/checkout/success", routeAuth, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", routeAuth, shopController.getCheckout);

module.exports = router;
