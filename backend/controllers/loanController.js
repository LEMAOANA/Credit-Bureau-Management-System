const Loan = require('../models/Loan'); // Import Loan model

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('borrower');
    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching loans'
    });
  }
};

// Get a single loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('borrower');
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching loan'
    });
  }
};

// Approve loan
exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Reject loan
exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
