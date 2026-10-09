const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

const validateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);

  if (result.error) {
    throw new ExpressError(400, result.error.details[0].message);
  }

  next();
};

// The form sends image as a plain URL string, but the model stores { filename, url }
const buildListingData = (data) => {
  const { image, ...rest } = data;
  rest.image = { url: image ? image.trim() : "" };
  return rest;
};

// Display all listings
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }),
);

// Display form to create a new listing
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// Create a new listing
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const listing = new Listing(buildListingData(req.body.listing));
    listing.owner = req.user._id;

    await listing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  }),
);

// Display a single listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  }),
);

// Display edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
  }),
);

// Update listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    const { image, ...rest } = req.body.listing;
    listing.set(rest);

    // keep the old image if the image box was left empty
    if (image && image.trim() !== "") {
      listing.image.url = image.trim();
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }),
);

// Delete listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");

    res.redirect("/listings");
  }),
);

module.exports = router;
