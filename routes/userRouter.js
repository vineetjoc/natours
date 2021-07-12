const express = require('express');
// const app = express();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/signup', authController.signup);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); //makes sure all toutes below can only be accessed by llogged in user

router.route('/me').get(userController.getMe, userController.getUser);

router.patch(
  '/updatePassword',

  authController.updatePassword
);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.userPhotoResize,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
