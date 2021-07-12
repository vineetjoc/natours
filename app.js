const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const csp = require('express-csp');

const app = express();
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');
const bookingRouter = require('./routes/bookingRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const rateLimiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too may request from this IP. Try later!!!',
});
//global miidelwares
app.use(express.json({ limit: '10kb' })); //to get data from body into req.body
app.use(cookieParser()); //for getting cookie from the browser

//test middleware
app.use((req, res, next) => {
  // console.log(req.cookies);
  next();
});

app.use(mongoSanitize()); //security for attack agaisnt NOSQL injections
app.use(xss()); //security agaisnt html/js code
app.use(
  //for preventing parameter polluction
  hpp({
    whitelist: [
      'ratingsAverage',
      'ratingQuantity',
      'rating',
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(helmet()); //for security for http headers
csp.extend(app, {
  policy: {
    directives: {
      'default-src': ['self'],
      'style-src': ['self', 'unsafe-inline', 'https:'],
      'font-src': ['self', 'https://fonts.gstatic.com'],
      'script-src': [
        'self',
        'unsafe-inline',
        'data',
        'blob',
        'https://js.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:8828',
        'ws://localhost:56558/',
      ],
      'worker-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'frame-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'img-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'connect-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'wss://<HEROKU-SUBDOMAIN>.herokuapp.com:<PORT>/',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
    },
  },
});
//for debugging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); //for logggin in terminal
app.use('/api', rateLimiter); //for security

app.use(express.static(path.join(__dirname, 'public'))); //for serving static files//middleware
//for pug rendering
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); //these are subrouter which will be used as middleware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(`Can't browse ${req.originalUrl} for you`, 400);
  next(err);
});
app.use(globalErrorHandler); //error handling middleware

module.exports = app;
