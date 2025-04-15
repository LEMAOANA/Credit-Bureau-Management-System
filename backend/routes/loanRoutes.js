const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Loan Routes
router.post('/', loanController.createLoan);                // Create a new loan
router.get('/', loanController.getAllLoans);                // Get all loans
router.get('/:id', loanController.getLoanById);             // Get loan by ID
router.put('/:id', loanController.updateLoan);              // Update loan
router.delete('/:id', loanController.deleteLoan);           // Delete loan

// Repayment Routes
router.put('/:id/start-repayment', loanController.startRepayment);          // Start repayment for a loan
router.put('/:id/update-repayment-status', loanController.updateRepaymentStatus);  // Update repayment status (e.g., "Completed")
router.get('/:id/repayment-details', loanController.getRepaymentDetails);   // Get repayment details for a loan

module.exports = router;
