// controllers/repaymentController.js
const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');

exports.createRepayment = async (req, res) => {
    const { borrower, loan, paymentAmount, paymentDate, paymentType } = req.body;

    try {
        // Validate required fields
        if (!borrower) {
            return res.status(400).json({ success: false, message: 'Borrower is required.' });
        }

        if (!loan) {
            return res.status(400).json({ success: false, message: 'Loan ID is required.' });
        }

        // Fetch the loan and check if it belongs to the borrower
        const loanData = await Loan.findOne({ _id: loan, borrower });

        if (!loanData) {
            return res.status(404).json({ success: false, message: 'Loan not found for this borrower.' });
        }

        // Check if loan is approved (case-insensitive)
        if (loanData.status.toLowerCase() !== 'approved') {
            return res.status(400).json({ success: false, message: 'Only approved loans can be repaid.' });
        }

        // Create repayment
        const repayment = new Repayment({ borrower, loan, paymentAmount, paymentDate, paymentType });
        await repayment.save();

        // Calculate total paid and remaining
        const repayments = await Repayment.find({ loan });
        const totalPaid = repayments.reduce((sum, r) => sum + r.paymentAmount, 0);
        const remaining = loanData.totalRepaymentAmount - totalPaid;

        res.status(201).json({
            success: true,
            data: repayment,
            totalPaid,
            remaining
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.getAllRepayments = async (req, res) => {
    try {
        const repayments = await Repayment.find().populate('borrower').populate('loan');
        res.json({ success: true, data: repayments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getRepayment = async (req, res) => {
    try {
        const repayment = await Repayment.findById(req.params.id).populate('borrower').populate('loan');
        if (!repayment) return res.status(404).json({ success: false, message: 'Repayment not found' });
        res.json({ success: true, data: repayment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateRepayment = async (req, res) => {
    try {
        const updated = await Repayment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Repayment not found' });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteRepayment = async (req, res) => {
    try {
        const deleted = await Repayment.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Repayment not found' });
        res.json({ success: true, message: 'Repayment deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getRepaymentsByBorrower = async (req, res) => {
    const borrowerId = req.params.borrowerId;

    try {
        const repayments = await Repayment.find({ borrower: borrowerId })
            .populate('borrower')
            .populate('loan');

        res.json({ success: true, data: repayments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching repayments: ' + err.message });
    }
};
