const Loan = require('../models/Loan');

// Create a new loan
exports.createLoan = async (req, res) => {
  try {
    const loan = new Loan(req.body);
    await loan.save();
    res.status(201).json(loan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('borrower');
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('borrower');
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update loan
exports.updateLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete loan
exports.deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json({ message: 'Loan deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Start repayment for a loan
exports.startRepayment = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // Check if loan is already in repayment
    if (loan.repaymentStatus !== 'Not Started') {
      return res.status(400).json({ error: 'Repayment has already started or completed' });
    }

    // Set repayment status to 'In Progress'
    loan.repaymentStatus = 'In Progress';
    await loan.save();

    res.json({ message: 'Repayment started successfully', loan });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update repayment status (e.g., Completed)
exports.updateRepaymentStatus = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // Ensure loan is in progress before completing
    if (loan.repaymentStatus !== 'In Progress') {
      return res.status(400).json({ error: 'Repayment is not in progress' });
    }

    // Update repayment status to 'Completed'
    loan.repaymentStatus = 'Completed';
    await loan.save();

    res.json({ message: 'Repayment completed successfully', loan });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get repayment details for a loan
exports.getRepaymentDetails = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // Calculate remaining balance (if applicable)
    const remainingBalance = loan.totalRepaymentAmount - loan.amount;

    res.json({
      totalRepaymentAmount: loan.totalRepaymentAmount,
      repaymentStatus: loan.repaymentStatus,
      remainingBalance: remainingBalance > 0 ? remainingBalance : 0,
      repaymentStartDate: loan.repaymentStartDate,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get all loans for a specific borrower
exports.getLoansByBorrowerId = async (req, res) => {
  try {
    const { borrowerId } = req.params;
    const loans = await Loan.find({ borrower: borrowerId }).populate('borrower');
    res.json(loans);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
