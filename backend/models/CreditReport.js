const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the CreditReport schema
const CreditReportSchema = new Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrower',
    required: true,
  },
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true,
  },
  totalRepaymentsMade: {
    type: Number,
    required: true,
  },
  outstandingBalance: {
    type: Number,
    required: true,
  },
  creditScore: {
    type: Number,
    required: true,
  },
  repaymentHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repayment',
  }],
}, { timestamps: true });

// Create and export the CreditReport model
module.exports = mongoose.model('CreditReport', CreditReportSchema);
