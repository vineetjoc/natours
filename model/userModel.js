const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your name'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide your email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
    // required: [true, 'Please provide your photo'],
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'tour-guide', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'A User must have a confirmPassword'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  changedPasswordAfter: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  // console.log('in hashing');
  next();
});
//setting the changedPasswordAfter property

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.changedPasswordAfter = Date.now() - 1000; //subtracting one sec because sometimes token is created before this so thats y
  next();
});

//query miidleware
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
//instance function
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPassword = function (JWT_Timestamp) {
  const changedPassword = this.changedPasswordAfter;
  if (changedPassword) {
    const timepassed = parseInt(changedPassword.getTime() / 1000, 10); //get time in seconds bcz timestamp also has time in seconds
    return timepassed > JWT_Timestamp;
  }
  return false; //meanining password was not changed
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //creating 32 charac hex string token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); //encrpyting token to store in DB
  // this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //token expires after 10 min from now
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
