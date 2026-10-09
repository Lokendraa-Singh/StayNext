const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

// Only logged-in users can pass
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // remember where the user wanted to go, so we can send them back after login
    if (req.method === "GET") {
      req.session.redirectUrl = req.originalUrl;
    } else if (req.params.id) {
      req.session.redirectUrl = `/listings/${req.params.id}`;
    }
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
};

// passport clears the session on login, so copy the url to res.locals first
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Only the owner of a listing can edit / delete it
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  if (!listing.owner || !listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Only the author of a review can delete it
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review does not exist!");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author || !review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
