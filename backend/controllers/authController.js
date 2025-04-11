const User = require('../models/User');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

// 1. First define all your functions

// Signup function
const signup = async (req, res, next) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Basic validation
    if (!username || !email || !password || !passwordConfirm) {
      return next(new AppError('All fields are required', 400));
    }

    const newUser = await User.create({
      username,
      email,
      password,
      passwordConfirm
    });

    // Remove password from output
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
  } catch (err) {
    next(err);
  }
};

// Login function
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// authController.js
module.exports = {
  signup,
  login,
};