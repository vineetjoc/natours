const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();
// router.param('id', tourController.checkID);

router.use('/:id/reviews', reviewRouter);
router
  .route('/top-cheap-tours')
  .get(tourController.alias, tourController.getTours);

router.route('/getStats').get(tourController.aggregatePipeline);
router
  .route('/tour-monthly/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.monthlyPlan
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourswithin);
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistance);
router
  .route('/')
  .get(tourController.getTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.postTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(authController.restrictTo('admin'), tourController.deleteTour);
// router
//   .route('/:id/reviews')
//   .post(
//
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );
module.exports = router;
