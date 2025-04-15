const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrower',
    required: [true, 'Borrower is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [100, 'Minimum loan amount is 100'],
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate must be positive'],
  },
  loanTerm: {
    type: Number,
    required: [true, 'Loan term is required'],
    min: [1, 'Loan term must be at least 1 month'],
    validate: {
      validator: (v) => Number.isInteger(v),
      message: 'Loan term must be an integer',
    },
  },
  purpose: {
    type: String,
    required: [true, 'Loan purpose is required'],
    trim: true,
    maxlength: [255, 'Loan purpose cannot exceed 255 characters'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  repaymentStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  repaymentStartDate: {
    type: Date,
    required: [true, 'Repayment start date is required'],
  },
  totalRepaymentAmount: {
    type: Number,
    default: function () {
      return this.amount + (this.amount * (this.interestRate / 100));
    },
    get: (v) => Math.round(v * 100) / 100,
  },
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
