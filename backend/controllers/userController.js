const User = require('../models/User');

// Create a new user
exports.createUser = async (req, res) => {
  const { password, passwordConfirm } = req.body;

  // Step 1: Check if passwords match
  if (password !== passwordConfirm) {
    return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }

  // Step 2: Remove passwordConfirm from the request body before saving the user
  delete req.body.passwordConfirm;

  try {
    const user = new User(req.body); // Create a new user with the sanitized body
    await user.save(); // Save the user to the database
    res.status(201).json({ success: true, data: user }); // Send success response
  } catch (err) {
    res.status(400).json({ success: false, error: err.message }); // Send error response
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated user
      runValidators: true // Validate the update
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};