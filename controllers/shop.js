const path = require("path");
const fs = require("fs");

const PDFDocument = require("pdfkit");
const Product = require("../models/product");
const Cart = require("../models/cart");
const User = require("../models/user");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send("500 server error");
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findAll({ where: { id: prodId } })
    .then((result) => {
      let product = result[0].dataValues;
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Product Details",
        path: "/products/" + prodId,
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  let message = req.flash("success");
  if (message) {
    message = message[0];
  } else {
    message = false;
  }
  Product.findAll().then((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      successMessage: message,
    });
  });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      res.render("shop/cart", {
        cart: { productList: products, totalPrice: 0 },
        pageTitle: "Cart",
        path: "/cart",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  let prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  console.log(prodId);

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;

        return fetchedCart.addProduct(product, {
          through: { quantity: newQuantity },
        });
      }

      return Product.findByPk(prodId)
        .then((product) => {
          return fetchedCart.addProduct(product, {
            through: { quantity: newQuantity },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
  Product.findByPk(prodId);
};

exports.deleteFromCart = (req, res, next) => {
  let id = req.body.id;

  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({
        where: {
          id: id,
        },
      });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user.createOrder().then((order) => {
        return order.addProducts(
          products.map((product) => {
            product.orderItem = {
              quantity: product.cartItem.quantity,
            };
            return product;
          })
        );
      });
    })
    .then((result) => {
      fetchedCart.setProducts(null).then(() => {
        res.redirect("/orders");
      });
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ["products"] })
    .then((result) => {
      console.log(result);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoicename = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoicename);

  Order.findByPk(orderId)
    .then((order) => {
      if (!order) {
        next(new Error("Order was not found."));
      } else {
        if (order.dataValues.userId !== req.user.id) {
          next(new Error("Order was not found"));
        } else {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            'inline; filename="' + invoicename + '"'
          );
          order.getOrderItems().then((orderItems) => {
            console.log(orderItems);
          });
          order.getProducts().then((products) => {
            console.log(products);
            let items = products.map((p) => {
              return {
                title: p.dataValues.title,
                price: p.dataValues.price,
              };
            });

            console.log(items);
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(invoicePath));
            doc.pipe(res);

            doc.font("Helvetica-Bold").text("Invoice", { align: "center" });

            items.forEach((item) => {
              doc.moveDown();
              doc.font("Helvetica").text(item.title + ": $" + item.price);
            });

            doc.end();
          });
        }
      }
    })
    .catch((err) => {
      next(err);
    });
};
