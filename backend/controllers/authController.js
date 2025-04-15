const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError'); // Assuming you have this class to handle errors

// Utility to sign a JWT token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  // Basic validation
  if (!username || !email || !password || !passwordConfirm) {
    return next(new AppError('Please fill in all required fields.', 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match.', 400));
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return next(new AppError('Username already exists. Please choose another.', 400));
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return next(new AppError('Email is already registered. Please log in or use another.', 400));
  }

  try {
    // Create new user
    const newUser = await User.create({
      username,
      email,
      password,
      passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (err) {
    console.error('Error creating user:', err);
    return next(new AppError('Something went wrong while creating the user.', 500));
  }
});


exports.signin = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide both email and password.', 400));
  }

  try {
    // Find user with the provided email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('User not found. Please sign up first.', 404));
    }

    // Validate password
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect password. Please try again.', 401));
    }

    // Generate JWT token
    const token = signToken(user._id);

    // Exclude password from response
    user.password = undefined;

    // Send success response
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error('Signin error:', err);
    return next(new AppError('Something went wrong while signing in.', 500));
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    // Check if req.user exists (protected route)
    if (!req.user) {
      return next(new AppError('You must be logged in to access this resource.', 401));
    }

    // Return the currently logged-in user
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user, // Provided by the 'protect' middleware
      },
    });
  } catch (err) {
    console.error('Error retrieving current user:', err);
    return next(new AppError('Something went wrong while retrieving user data.', 500));
  }
};
