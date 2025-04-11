const CreditReport = require('../models/CreditReport');  // Assuming your CreditReport model path is correct
const Borrower = require('../models/Borrower');  // Assuming Borrower model path
const Loan = require('../models/Loan');  // Assuming Loan model path
const Repayment = require('../models/Repayment');  // Assuming Repayment model path

// GET all credit reports
exports.getAllCreditReports = async (req, res) => {
  try {
    const creditReports = await CreditReport.find()
      .populate('borrower', 'name email')  // Populate only essential borrower details
      .populate('loanId', 'loanAmount loanPurpose')  // Populate only essential loan details
      .populate('repaymentHistory');  // Populate repayment history

    res.status(200).json({
      success: true,
      count: creditReports.length,
      data: creditReports,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Something went wrong while fetching credit reports',
      details: err.message,
    });
  }
};

// GET credit report for a specific borrower by borrowerId
exports.getCreditReportByBorrowerId = async (req, res) => {
  try {
    const borrowerId = req.params.borrowerId;

    // Validate borrowerId
    if (!borrowerId) {
      return res.status(400).json({
        success: false,
        error: 'Borrower ID is required',
      });
    }

    const creditReport = await CreditReport.findOne({ borrower: borrowerId })
      .populate('borrower', 'name email')  // Populate only essential borrower details
      .populate('loanId', 'loanAmount loanPurpose')  // Populate only essential loan details
      .populate('repaymentHistory');

    if (!creditReport) {
      return res.status(404).json({
        success: false,
        error: 'Credit report not found for this borrower',
      });
    }

    res.status(200).json({
      success: true,
      data: creditReport,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Something went wrong while fetching the credit report',
      details: err.message,
    });
  }
};

// DELETE credit report by borrowerId
exports.deleteCreditReport = async (req, res) => {
  try {
    const borrowerId = req.params.borrowerId;

    // Validate borrowerId
    if (!borrowerId) {
      return res.status(400).json({
        success: false,
        error: 'Borrower ID is required',
      });
    }

    const creditReport = await CreditReport.findOneAndDelete({ borrower: borrowerId });

    if (!creditReport) {
      return res.status(404).json({
        success: false,
        error: 'Credit report not found for this borrower',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Credit report successfully deleted',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Something went wrong while deleting the credit report',
      details: err.message,
    });
  }
};

// POST: Create a new credit report
exports.createCreditReport = async (req, res) => {
    try {
      const { borrower, loanId, creditScore, reportDate, repaymentHistory, remarks } = req.body;
  
      if (!borrower || !loanId || !creditScore || !reportDate) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: borrower, loanId, creditScore, reportDate',
        });
      }
  
      const newReport = await CreditReport.create({
        borrower,
        loanId,
        creditScore,
        reportDate,
        repaymentHistory,
        remarks,
      });
  
      res.status(201).json({
        success: true,
        data: newReport,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'Failed to create credit report',
        details: err.message,
      });
    }
  };

  // PUT: Update an existing credit report by borrowerId
exports.updateCreditReport = async (req, res) => {
    try {
      const borrowerId = req.params.borrowerId;
  
      const updatedData = req.body;
  
      const updatedReport = await CreditReport.findOneAndUpdate(
        { borrower: borrowerId },
        updatedData,
        { new: true, runValidators: true }
      ).populate('borrower', 'name email')
       .populate('loanId', 'loanAmount loanPurpose')
       .populate('repaymentHistory');
  
      if (!updatedReport) {
        return res.status(404).json({
          success: false,
          error: 'Credit report not found for this borrower',
        });
      }
  
      res.status(200).json({
        success: true,
        data: updatedReport,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'Failed to update credit report',
        details: err.message,
      });
    }
  };
  