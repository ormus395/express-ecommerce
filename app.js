// main app imports
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const SessionStore = require("connect-session-sequelize")(session.Store);
const csurf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
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
// csrfProtection is an express middleware that generates a random token to validate post request from forms
const csrfProtection = csurf();
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

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(multer({ storage: fileStorage }).single("image"));
// to send a folder for the browser to access
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// session middlware used to maintain user persistence on the server
app.use(
  session({
    secret: "doge has no idea",
    store: new SessionStore({ db: db }),
    resave: false,
    saveUninitialized: false,
  })
);
app.use(csrfProtection);
app.use(flash());
// app.use uses any middleware,
// middleware are functions used by express before or after any
// request event from the browser

// add the sequelize user to the req object using the session data
app.use((req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    User.findByPk(req.session.user.id)
      .then((user) => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        throw new Error(err);
      });
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.isLoggedIn,
  });
});

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
Cart.belongsTo(User);
User.hasOne(Cart);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

//db.sync({ force: true })
db.sync()
  .then((result) => {
    app.listen(3000, () => {
      console.log("Server started");
    });
  })
  .catch((err) => {
    console.log(err);
  });
