const { validationResult } = require("express-validator");
const deleteFile = require("../util/file");
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
  console.log("I was called to post a product");
  const errors = validationResult(req);
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  console.log(image);

  const imageUrl = "/" + image.path;
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
  const updatedImage = req.file;
  const updatedDescription = req.body.description;
  const imageUrl = "/" + updatedImage.path;

  if (!errors.isEmpty()) {
    return res.status(400).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      errorMessage: errors.errors[0].msg,
      errors: errors.array(),
      product: {
        id: prodId,
        title: updatedTitle,
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

        deleteFile(result.dataValues.imageUrl);

        result.title = updatedTitle;
        result.price = updatedPrice;
        result.imageUrl = imageUrl;
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
            description: updatedDescription,
            price: updatedPrice,
          },
        });
      });
  }
};

exports.deleteProduct = (req, res, next) => {
  Product.findByPk(req.body.id)
    .then((product) => {
      deleteFile(product.dataValues.imageUrl);
      Product.destroy({
        where: {
          id: req.body.id,
          userId: req.user.id,
        },
      }).then((result) => {
        console.log("destroy", result);
        res.redirect("/admin/products");
      });
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

exports.delete = (req, res, next) => {
  let id = req.body.id;

  Product.findByPk(id)
    .then((product) => {
      deleteFile(product.dataValues.imageUrl);
      Product.destroy({
        where: {
          id: req.body.id,
          userId: req.user.id,
        },
      }).then((result) => {
        console.log("destroy", result);
        res
          .status(200)
          .json({ success: true, message: "Product deleted successfully." });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
