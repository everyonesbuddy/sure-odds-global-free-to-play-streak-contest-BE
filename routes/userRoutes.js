const express = require('express');
const factoryController = require('../controllers/factoryController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authController.protect);

router.route('/updatePassword').patch(userController.updatePassword);

router.route('/register').post(userController.registerForContest);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/update')
  .patch(userController.setUserId, userController.updateUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
