const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// CRUD Routes
router.post('/users', createUser); // Create
router.get('/users', getAllUsers); // Read all
router.get('/users/:id', getUser); // Read one
router.put('/users/:id', updateUser); // Update
router.delete('/users/:id', deleteUser); // Delete

module.exports = router;