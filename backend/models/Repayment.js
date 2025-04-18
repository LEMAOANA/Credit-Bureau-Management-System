// models/Repayment.js
const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower',
        required: true
    },
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
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
        enum: ['Cash', 'Transfer', 'Mobile', 'Other', 'Bank Transfer'], // Added 'Bank Transfer'
        required: true
    }
}, { timestamps: true });

const Repayment = mongoose.model('Repayment', repaymentSchema);
module.exports = Repayment;
