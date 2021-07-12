const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    changedPasswordAfter: req.body.changedPasswordAfter,
    role: req.body.role,
  }); //creating new User
  const url = `${req.protocol}//:${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Enter email and password'));
  }

  //check if email exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  //   const checkPassword = await user.correctPassword(password,user.password);//here we used instance function declared in usermodel
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 500));
  }

  //sendind token as response
  createSendToken(user, 200, res);
});
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1> checking if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //   console.log(`hi token here ${req.headers.authorization.split(' ')}`);
  //   console.log(token);
  if (!token) {
    return next(new AppError('You have to Login first', 501));
  }
  //verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
  // console.log(decoded);
  //check ifthe user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User doesnt exist', 401));
  }
  //if password was recently changed

  const changed = currentUser.changedPassword(decoded.iat);
  if (changed) {
    return next(
      new AppError('Password was changed recently please login again', 401)
    );
  }
  //grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});
//for checking if user is logged in
exports.isLoggedIn = async (req, res, next) => {
  let token;
  //1> checking if token exists
  try {
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next();
    }
    //verifying token
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    // console.log(decoded);
    //check ifthe user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
    //if password was recently changed

    const changed = currentUser.changedPassword(decoded.iat);
    if (changed) {
      return next();
    }
    //grant access to protected route
    res.locals.user = currentUser;
  } catch (err) {
    return next();
  }
  next();
};
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      next(new AppError('You are not Authorized to modify the Document'));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }); //finding user with mail id
  //   console.log(user, req.body.email);
  if (!user) {
    return next(new AppError('Please enter you valid Email'), 404);
  }

  //creating random token
  const resetToken = user.createPasswordResetToken();
  //   await user.save();
  await user.save({ validateBeforeSave: false }); //saving so that the chenges made in previous function reflect

  //sending mail to user
  // console.log(user);

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).resetPassword();
    res.status(200).json({
      status: 'success',
      data: 'email sent successfully to your email',
      resetToken,
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
    // console.log(err, err.message);
    return next(
      new AppError('There was error in sending email please try again', 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user from the token
  // const { token } = req.params;
  const encryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user)
    return next(new AppError('Either the token expired or its incorrect', 500));

  // console.log(user);
  //setting the new password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  // user.confirmPassword = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //setting the passwordchangedAt property,when done user.save we are running a middleware for passwordchangedAt

  //sending response
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  //get the user from dB
  //remember we have user in req.user because of protect function
  // console.log(req.file);

  const user = await User.findOne(req.user._id).select('+password');

  const { currentPassword, password, confirmPassword } = req.body;
  const correct = await user.correctPassword(currentPassword, user.password);
  if (!correct)
    return next(
      new AppError(
        'Your sent password doesnt match with your current password',
        401
      )
    );
  user.password = password;
  user.confirmPassword = confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});
exports.logout = async (req, res) => {
  res.cookie('jwt', 'Logged Out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
