const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');
const Borrower = require('../models/Borrower');

// GET all repayments
exports.getRepayments = async (req, res) => {
  try {
    const repayments = await Repayment.find()
      .populate('borrower', 'name email')
      .populate('loan', 'amount purpose');  // Now matches the schema

    res.status(200).json({ success: true, count: repayments.length, data: repayments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET single repayment
exports.getRepaymentById = async (req, res) => {
  try {
    const repayment = await Repayment.findById(req.params.id)
      .populate('borrower', 'name email')
      .populate('loan', 'amount purpose');

    if (!repayment) {
      return res.status(404).json({ success: false, message: 'Repayment not found' });
    }

    res.status(200).json({ success: true, data: repayment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// CREATE a repayment
exports.createRepayment = async (req, res) => {
  try {
    const { borrowerId, loan, paymentAmount, paymentDate, paymentType } = req.body;

    const borrowerExists = await Borrower.findById(borrowerId);
    if (!borrowerExists) {
      return res.status(404).json({ success: false, message: "Borrower not found" });
    }

    const loanExists = await Loan.findById(loan);
    if (!loanExists) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }

    const repayment = await Repayment.create({
      borrower: borrowerId,
      loan,
      paymentAmount,
      paymentDate,
      paymentType
    });

    res.status(201).json({ success: true, message: 'Repayment created', data: repayment });
  } catch (err) {
    console.error('Error creating repayment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE a repayment
exports.updateRepayment = async (req, res) => {
  try {
    const repayment = await Repayment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!repayment) {
      return res.status(404).json({ success: false, message: 'Repayment not found' });
    }

    res.status(200).json({ success: true, message: 'Repayment updated', data: repayment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE a repayment
exports.deleteRepayment = async (req, res) => {
  try {
    const repayment = await Repayment.findByIdAndDelete(req.params.id);

    if (!repayment) {
      return res.status(404).json({ success: false, message: 'Repayment not found' });
    }

    res.status(200).json({ success: true, message: 'Repayment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
