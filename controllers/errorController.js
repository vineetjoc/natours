const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  // console.log(err.isOperational);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stackTrace: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something Went wrong!!!!',
    msg: err.message,
  });
};

const handleCastError = (error) => {
  const message = `invalid ${error.path} is ${error.value}`;
  return new AppError(message, 400);
};
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        title: 'Something Went Wrong',
        message: err.message,
      });
    }
    return res.status(500).json({
      title: 'Something Went Wrong',
      message: err.message,
    });
  }
  if (err.isOperational) {
    // console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong',
      message: err.message,
    });
  }
  res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong',
    message: 'Please Try again !!!!',
  });
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate Field Value:${value}. Please use some other`;

  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const values = Object.values(err.errors).map((el) => el.message);
  const message = `Validation failde becaues of ${values.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = (err) =>
  new AppError('Invalid token please login again', 401);
const handleExpiredTokenError = (err) =>
  new AppError('Token Expired, Please Login again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);

    if (error.name === 'CastError') error = handleCastError(error); //error.name and other s are defined in error
    if (error.code === 11000) error = handleDuplicateFieldsDB(error); //duplicate values in schemas
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error); //if token sent is wromg
    if (error.name === 'TokenExpiredError')
      error = handleExpiredTokenError(error);
    // console.log(error.message);
    sendErrorProd(error, req, res);
  }
  next();
};
