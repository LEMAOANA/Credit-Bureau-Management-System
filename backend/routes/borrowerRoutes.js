const express = require('express');
const router = express.Router();
const borrowerController = require('../controllers/borrowerController');

// Route to create a borrower
router.post('/borrowers', borrowerController.createBorrower);

// Route to get all borrowers
router.get('/borrowers', borrowerController.getAllBorrowers);

// Route to get a single borrower by ID
router.get('/borrowers/:id', borrowerController.getBorrowerById);

// Route to update borrower details
router.put('/borrowers/:id', borrowerController.updateBorrower);

// Route to delete a borrower
router.delete('/borrowers/:id', borrowerController.deleteBorrower);

module.exports = router;
