const express = require('express');
const router = express.Router();
const {
  getRepayments,
  getRepaymentById,
  createRepayment,
  updateRepayment,
  deleteRepayment
} = require('../controllers/repaymentController');

router.get('/', getRepayments); // All repayments
router.get('/:id', getRepaymentById); // Single repayment
router.post('/', createRepayment); // Create
router.put('/:id', updateRepayment); // Update
router.delete('/:id', deleteRepayment); // Delete

module.exports = router;
