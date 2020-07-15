// main app imports
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

//controller imports
// error controller handles 404's for now
const errorController = require("./controllers/error");

// database import
const db = require("./util/database");

// create the app
const app = express();

// set the view engine
app.set("view engine", "ejs");
app.set("views", "views");

// import the routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const { response } = require("express");

//import models
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

// set the body parser for parsing incoming requests
app.use(bodyParser.urlencoded({ extended: false }));
// to send a folder for the browser to access
app.use(express.static(path.join(__dirname, "public")));

// app.use uses any middleware,
// middleware are functions used by express before or after any
// request event from the browser
// This one searches db for a user
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
Cart.belongsTo(User);
User.hasOne(Cart);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

// db.sync({ force: true })
db.sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Jarec", email: "test@test.com" });
    } else {
      return Promise.resolve(user);
    }
  })
  .then((user) => {
    return user.createCart();
  })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server started");
    });
  })
  .catch((err) => {
    console.log(err);
  });
