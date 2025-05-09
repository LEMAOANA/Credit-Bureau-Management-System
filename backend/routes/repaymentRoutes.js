// routes/repaymentRoutes.js
const express = require('express');
const router = express.Router();
const repaymentController = require('../controllers/repaymentController');

router.post('/', repaymentController.createRepayment);
router.get('/', repaymentController.getAllRepayments);
router.get('/:id', repaymentController.getRepayment);
router.put('/:id', repaymentController.updateRepayment);
router.delete('/:id', repaymentController.deleteRepayment);
router.get('/borrower/:borrowerId', repaymentController.getRepaymentsByBorrower);

module.exports = router;
