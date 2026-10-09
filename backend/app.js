// Loads variables from the .env file (only used on your own computer)
require("dotenv").config();
require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStoreModule = require("connect-mongo");
const MongoStore = MongoStoreModule.default || MongoStoreModule;
const flash = require("connect-flash");
const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");
const users = require("./routes/user.js");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const isProduction = process.env.NODE_ENV === "production";

// MongoDB connection URL (Atlas on the internet, local MongoDB on your PC)
const MONGO_URL =
  process.env.ATLAS_DB_URL || "mongodb://127.0.0.1:27017/wanderLust";
const SESSION_SECRET = process.env.SESSION_SECRET || "mysupersecretcode";
const PORT = process.env.PORT || 8080;

// Render (and most hosts) put the app behind a proxy
if (isProduction) {
  app.set("trust proxy", 1);
}

// Middleware
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
// all pages (EJS) and static files (css, js) live in the frontend folder
app.set("views", path.join(__dirname, "../frontend/views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Sessions are stored in MongoDB, so users stay logged in after a restart
const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport (login system)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Variables available in every EJS file
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Connect to MongoDB, then start the server
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
      console.log(`server is listening to port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// Home Route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Static pages linked in the footer
app.get("/privacy", (req, res) => {
  res.render("pages/privacy.ejs");
});

app.get("/terms", (req, res) => {
  res.render("pages/terms.ejs");
});

app.use("/listings", listings);

// ==================== REVIEWS ====================

app.use("/listings/:id/reviews", reviews);

// ==================== USERS ====================

app.use("/", users);

// ==================== ERROR HANDLING ====================

// Handle requests for routes that do not exist
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let { statusCode = 500, message = "Something went wrong" } = err;

  // wrong / broken id in the url, e.g. /listings/abc
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Page not found";
  }

  res.status(statusCode).render("error.ejs", { message });
});
