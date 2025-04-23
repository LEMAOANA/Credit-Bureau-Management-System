const express = require('express');
const router = express.Router();
const { 
  generateCreditReport, 
  downloadCreditReport, 
  downloadCreditReportCSV 
} = require('../controllers/creditReportController');

// Route to generate a credit report in JSON format
router.get('/:borrowerId', generateCreditReport);

// Route to download the credit report in PDF format
router.get('/:borrowerId/pdf', downloadCreditReport);

// Route to download the credit report in CSV format
router.get('/:borrowerId/csv', downloadCreditReportCSV);

module.exports = router;
