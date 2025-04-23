const fs = require('fs');
const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');
const Repayment = require('../models/Repayment');
const { generateCreditReportPDF } = require('../utils/pdfGenerator');
const { generateCreditReportCSV } = require('../utils/csvGenerator');  // Import the CSV generator

// Generate Credit Report (JSON Format)
exports.generateCreditReport = async (req, res) => {
  try {
    const { borrowerId } = req.params;
    const report = await generateReportData(borrowerId);

    res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error generating credit report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate credit report',
      error: error.message
    });
  }
};

// Generate Credit Report (CSV Format)
exports.downloadCreditReportCSV = async (req, res) => {
  try {
    const { borrowerId } = req.params;

    // Generate report data
    const report = await generateReportData(borrowerId);

    // Generate CSV file path
    const filePath = `./reports/credit-report-${borrowerId}-${Date.now()}.csv`;

    // Generate the CSV file using the csv generator utility
    await generateCreditReportCSV(report, filePath);

    // Send and delete file
    res.download(filePath, () => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Cleanup after download
        console.log('File successfully deleted:', filePath);
      } else {
        console.warn('File not found for deletion:', filePath);
      }
    });

  } catch (error) {
    console.error('Error generating CSV report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSV report',
      error: error.message
    });
  }
};

// Generate PDF Credit Report
exports.downloadCreditReport = async (req, res) => {
  try {
    const { borrowerId } = req.params;

    // Generate report data
    const report = await generateReportData(borrowerId);

    // Generate PDF file path
    const filePath = `./reports/credit-report-${borrowerId}-${Date.now()}.pdf`;
    await generateCreditReportPDF(report, filePath);

    // Send and delete file
    res.download(filePath, () => {
      // Check if the file exists before trying to delete it
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // cleanup
        console.log('File successfully deleted:', filePath);
      } else {
        console.warn('File not found for deletion:', filePath);
      }
    });

  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
};

// Shared logic for both JSON, CSV, and PDF generation
async function generateReportData(borrowerId) {
  const borrower = await Borrower.findById(borrowerId);
  if (!borrower) {
    throw new Error('Borrower not found');
  }

  const loans = await Loan.find({ borrower: borrowerId });
  const repayments = await Repayment.find({ borrower: borrowerId });

  const totalBorrowed = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalInterest = loans.reduce((sum, loan) => sum + (loan.amount * (loan.interestRate / 100)), 0);
  const totalRepaid = repayments.reduce((sum, repayment) => sum + repayment.paymentAmount, 0);
  const totalOutstanding = totalBorrowed + totalInterest - totalRepaid;
  const creditScore = calculateCreditScore(loans, repayments);

  return {
    borrowerInfo: {
      name: borrower.name,
      email: borrower.email,
      phone: borrower.phone,
      borrowerId: borrower.borrowerId
    },
    summary: {
      totalLoans: loans.length,
      totalBorrowed,
      totalRepaid,
      totalOutstanding,
      creditScore
    },
    loanDetails: loans.map(loan => ({
      loanId: loan._id,
      amount: loan.amount,
      interestRate: loan.interestRate,
      purpose: loan.purpose,
      status: loan.status,
      repaymentStatus: loan.repaymentStatus,
      totalRepaymentAmount: loan.totalRepaymentAmount
    })),
    repaymentHistory: repayments.map(repayment => ({
      date: repayment.paymentDate,
      amount: repayment.paymentAmount,
      method: repayment.paymentType
    }))
  };
}

// Credit Score Calculation
function calculateCreditScore(loans, repayments) {
  let score = 650;
  const onTimePayments = repayments.filter(r => true).length; // Simplified logic
  const latePayments = repayments.length - onTimePayments;
  const activeLoans = loans.filter(l => l.status === 'Approved' && l.repaymentStatus !== 'Completed').length;

  score += onTimePayments * 5;
  score -= latePayments * 10;
  score -= activeLoans * 3;

  return Math.min(Math.max(score, 300), 850);
}
