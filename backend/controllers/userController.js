const User = require('../models/User');

// Create a new user (Signup)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Check if passwords match
    if (password !== passwordConfirm) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    // Create new user (keep passwordConfirm for validation in schema)
    const newUser = await User.create({ username, email, password, passwordConfirm });

    // Hide sensitive fields in response
    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, data: userObj });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
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
    // Optional: prevent updating password directly from here
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({ success: false, error: 'Use the password update endpoint' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password -__v');

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
