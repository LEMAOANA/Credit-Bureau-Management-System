const mongoose = require('mongoose');
const Loan = require('./Loan'); // Import Loan model
const { v4: uuidv4 } = require('uuid');  // Import uuid to generate unique IDs

const borrowerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^\S+@\S+\.\S+$/.test(email);
      },
      message: 'Please provide a valid email'
    }
  },

  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(phone) {
        return /^\+?\d{7,15}$/.test(phone);
      },
      message: 'Please provide a valid phone number'
    }
  },

  loanAmount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [100, 'Minimum loan amount is 100']
  },

  loanPurpose: {
    type: String,
    required: [true, 'Loan purpose is required'],
    trim: true,
    maxlength: [255, 'Loan purpose cannot exceed 255 characters']
  },

  nationalId: {
    type: String,
    required: false, // Make this field optional
    unique: false,   // Remove the unique constraint if it's not needed
  },

  borrowerId: {
    type: String,
    unique: true,
    default: uuidv4 // Automatically generate a unique borrowerId
  },
  // ... existing fields ...
  creditScore: {
    type: Number,
    default: 650,
    min: 300,
    max: 850
  },
  lastCreditCheck: {
    type: Date
  }

}, {
  timestamps: true
});

// Pre-save hook (optional since timestamps handles this)
borrowerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Post-save hook to auto-create a Loan
borrowerSchema.post('save', async function(doc, next) {
  try {
    await Loan.create({
      borrower: doc._id,
      amount: doc.loanAmount,
      purpose: doc.loanPurpose,
      interestRate: 5, // default value
      loanTerm: 12, // 12 months
      repaymentStartDate: new Date() // starts now
    });
    
    next();
  } catch (error) {
    next(error);
  }


});

const Borrower = mongoose.model('Borrower', borrowerSchema);
module.exports = Borrower;
