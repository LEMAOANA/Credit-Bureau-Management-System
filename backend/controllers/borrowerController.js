const Borrower = require('../models/Borrower'); // Import Borrower model
const Loan = require('../models/Loan'); // Import Loan model

// Create a new borrower
exports.createBorrower = async (req, res) => {
  try {
    const { name, email, phone, loanAmount, loanPurpose, nationalId } = req.body;

    const newBorrower = new Borrower({
      name,
      email,
      phone,
      loanAmount,
      loanPurpose,
      nationalId
    });

    await newBorrower.save();
    res.status(201).json({
      success: true,
      message: 'Borrower created successfully',
      data: newBorrower
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all borrowers
exports.getAllBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find();
    res.status(200).json({
      success: true,
      count: borrowers.length,
      data: borrowers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching borrowers'
    });
  }
};

// Get a single borrower by ID
exports.getBorrowerById = async (req, res) => {
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }
    res.status(200).json({
      success: true,
      data: borrower
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching borrower'
    });
  }
};

// Update borrower details
exports.updateBorrower = async (req, res) => {
  try {
    const borrower = await Borrower.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }
    res.status(200).json({
      success: true,
      data: borrower
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a borrower
exports.deleteBorrower = async (req, res) => {
  try {
    const borrower = await Borrower.findByIdAndDelete(req.params.id);
    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Borrower deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting borrower'
    });
  }
};
