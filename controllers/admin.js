const { validationResult } = require("express-validator");
const Product = require("../models/product");
const User = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    errorMessage: false,
    errors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  if (!errors.isEmpty()) {
    return res.status(400).render("admin/add-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      errorMessage: errors.errors[0].msg,
      errors: errors.array(),
    });
  } else {
    req.user
      .createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user.id,
      })
      .then((result) => {
        console.log(result);
        res.redirect("/admin/products");
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).render("admin/add-product", {
          pageTitle: "Add Product",
          path: "/admin/add-product",
          errorMessage: "Database oeration failed. Please try again.",
          errors: errors.array(),
        });
      });
  }
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log(prodId);

  req.user
    .getProducts({
      where: { id: prodId },
    })
    .then((result) => {
      let product = result[0].dataValues;
      res.render("admin/edit-product", {
        product: product,
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        errors: [],
        errorMessage: false,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const errors = validationResult(req);
  const prodId = req.body.id;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.body.imageUrl;
  const updatedDescription = req.body.description;

  if (!errors.isEmpty()) {
    return res.status(400).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      errorMessage: errors.errors[0].msg,
      errors: errors.array(),
      product: {
        id: prodId,
        title: updatedTitle,
        imageUrl: updatedImage,
        description: updatedDescription,
        price: updatedPrice,
      },
    });
  } else {
    Product.findByPk(prodId)
      .then((result) => {
        if (req.user.id !== result.userId) {
          return res.redirect("/");
        }
        result.title = updatedTitle;
        result.price = updatedPrice;
        result.imageUrl = updatedImage;
        result.description = updatedDescription;
        return result.save().then((result) => {
          res.redirect("/admin/products");
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: "/admin/edit-product",
          errorMessage: "Database operation failed. Please try again.",
          errors: errors.array(),
          product: {
            id: prodId,
            title: updatedTitle,
            imageUrl: updatedImage,
            description: updatedDescription,
            price: updatedPrice,
          },
        });
      });
  }
};

exports.deleteProduct = (req, res, next) => {
  Product.destroy({
    where: {
      id: req.body.id,
      userId: req.user.id,
    },
  })
    .then((result) => {
      console.log(result);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
