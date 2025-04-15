const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if token is present in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get the user from the decoded token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is provided
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
