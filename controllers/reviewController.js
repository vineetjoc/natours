const Review = require('../model/reviewModel');
// const catchAsync = require('../utils/catchAsync');

const Factory = require('./factory');

exports.TourReviewIDs = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = Factory.getAll(Review);
exports.createReview = Factory.createOne(Review);
exports.deleteReview = Factory.deleteOne(Review);
exports.updateReview = Factory.updateOne(Review);
exports.getReview = Factory.getOne(Review);
