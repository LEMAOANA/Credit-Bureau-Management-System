const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Loan Routes
router.post('/', loanController.createLoan);                     // Create a new loan
router.get('/', loanController.getAllLoans);                     // Get all loans
router.get('/:id', loanController.getLoanById);                  // Get loan by ID
router.put('/:id', loanController.updateLoan);                   // Update loan details
router.delete('/:id', loanController.deleteLoan);                // Delete loan
router.get('/borrower/:borrowerId', loanController.getLoansByBorrowerId);


// Repayment Routes
router.put('/:id/start-repayment', loanController.startRepayment);          // Start repayment
router.patch('/:id/update-repayment', loanController.updateRepaymentStatus);  // Update repayment status
router.get('/:id/repayment-details', loanController.getRepaymentDetails);   // Get repayment details

module.exports = router;
