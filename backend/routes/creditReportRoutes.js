const express = require('express');
const router = express.Router();
const creditReportController = require('../controllers/CreditReportController');

router.get('/', creditReportController.getAllCreditReports);
router.get('/:borrowerId', creditReportController.getCreditReportByBorrowerId);
router.post('/', creditReportController.createCreditReport);        // ✅ POST
router.put('/:borrowerId', creditReportController.updateCreditReport);  // ✅ PUT
router.delete('/:borrowerId', creditReportController.deleteCreditReport);

module.exports = router;