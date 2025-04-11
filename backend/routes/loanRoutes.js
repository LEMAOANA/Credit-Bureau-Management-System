const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Route to get all loans
router.get('/loans', loanController.getAllLoans);

// Route to get a single loan by ID
router.get('/loans/:id', loanController.getLoanById);

// Route to approve loan
router.put('/loans/:id/approve', loanController.approveLoan);

// Route to reject loan
router.put('/loans/:id/reject', loanController.rejectLoan);

module.exports = router;
