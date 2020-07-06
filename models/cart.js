const fs = require("fs");
const path = require("path");
const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  static addToCart(product) {
    let cart = { productList: [], totalPrice: 0 };

    fs.readFile(p, (err, data) => {
      if (err) {
        console.log("No cart");
        product.qty = 1;
        cart.productList.push(product);
        cart.totalPrice += product.price;
      } else {
        console.log("cart does exist");
        cart = JSON.parse(data);
        let productIndex = cart.productList.findIndex(
          (prod) => prod.id === product.id
        );

        if (productIndex > -1) {
          console.log("Item is in cart");
          let updatedProduct = cart.productList[productIndex];
          updatedProduct.qty++;
          cart.productList[productIndex] = updatedProduct;
          cart.totalPrice = cart.totalPrice + product.price;
        } else {
          product.qty = 1;
          cart.totalPrice += product.price;
          let newProductList = [...cart.productList, product];
          cart.productList = newProductList;
        }
      }
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }
};
