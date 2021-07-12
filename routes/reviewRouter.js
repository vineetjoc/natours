const express = require('express');

// const app = express();

const router = express.Router({ mergeParams: true }); //help in merging router on top of another
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.TourReviewIDs, reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.TourReviewIDs,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
// router
//   .route('/getAllReviews')
//   .get( reviewController.getAllReviews);
// router.post(
//   '/createReview',
//   authController.protect,
//   authController.restrictTo('user'),
//   reviewController.createReview
// );

module.exports = router;
