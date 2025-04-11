const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower',
        required: true
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    loan: {  // renamed from loanId to loan
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true
    }
}, { timestamps: true });

const Repayment = mongoose.model('Repayment', repaymentSchema);

module.exports = Repayment;
