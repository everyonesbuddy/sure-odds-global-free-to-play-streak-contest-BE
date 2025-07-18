const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const contests = new mongoose.Schema({
  name: {
    type: String,
  },
  accessCodeUsed: {
    type: String,
    default: null,
  },
  startDate: Date,
  endDate: Date,
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a user most have a name'],
    unique: true,
  },
  userName: {
    type: String,
    required: [true, 'a user most have a username'],
    unique: true,
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, 'a user must have an email'],
    validate: [validator.isEmail, 'please provide a valid email address'],
  },
  twitter: {
    type: String,
    unique: true,
  },
  reddit: {
    type: String,
    unique: true,
  },
  bluesky: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must confirm their password'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
    },
  },
  registeredContests: [contests],
  passwordChangedAt: Date,
  role: {
    type: String,
    required: [true, 'A user must have a role'],
    default: 'user',
  },
  profilePhoto: {
    type: String,
    default: 'default.jpg',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePasswords = async function (
  unencryptedPassword,
  encryptedPassword
) {
  return await bcrypt.compare(unencryptedPassword, encryptedPassword);
};

userSchema.methods.checkIfPasswordChanged = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  console.log('resetToken:', resetToken);
  return resetToken;
};

const User = new mongoose.model('User', userSchema);
module.exports = User;
