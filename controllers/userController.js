const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const Factory = require('./factory');

//The below multerStorage is to directly store in DataBase
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

//The below method is to Store file in local memory first than resize and later in Database
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image.Please Upload an Image.', 404), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter }); //for file upload
exports.uploadUserPhoto = upload.single('photo');

const getValidData = (Obj, ...inputs) => {
  const newObj = {};
  Object.keys(Obj).forEach((el) => {
    if (inputs.includes(el)) {
      newObj[el] = Obj[el];
    }
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.getAllUsers = Factory.getAll(User);
exports.getUser = Factory.getOne(User);
exports.deleteUser = Factory.deleteOne(User);
exports.updateUser = Factory.updateOne(User);
exports.createUser = (req, res, next) => {
  res.status(400).json({
    status: 'fail',
    message: 'Please use signup to create a user',
  });
};
exports.userPhotoResize = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg `;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
exports.updateMe = catchAsync(async (req, res, next) => {
  //get the user
  if (req.body.password || req.body.confirmPassword)
    return next(new AppError('This route is not for updating Password', 400));
  // console.log(req.body);
  // console.log(req.file);
  const dataObj = getValidData(req.body, 'name', 'email');
  // console.log(Object.keys(dataObj).length)
  if (req.file) {
    dataObj.photo = req.file.filename;
  } // console.log(dataObj);
  if (Object.keys(dataObj).length === 0)
    return next(new AppError('Please provide data to Update', 400));
  const updatedUser = await User.findByIdAndUpdate(req.user._id, dataObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
