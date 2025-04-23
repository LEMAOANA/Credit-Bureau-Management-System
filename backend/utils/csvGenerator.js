const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

// Function to generate CSV for credit report
exports.generateCreditReportCSV = async (report, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const borrowerInfo = report.borrowerInfo;

      // Flatten loan details
      const loanDetails = report.loanDetails.map(loan => ({
        loanId: loan.loanId,
        amount: loan.amount,
        interestRate: loan.interestRate,
        purpose: loan.purpose,
        status: loan.status,
        repaymentStatus: loan.repaymentStatus,
        totalRepaymentAmount: loan.totalRepaymentAmount,
        borrowerName: borrowerInfo.name,
        borrowerEmail: borrowerInfo.email
      }));

      // Flatten repayment history
      const repaymentHistory = report.repaymentHistory.map(repayment => ({
        date: repayment.date,
        amount: repayment.amount,
        method: repayment.method,
        remainingBalance: repayment.remainingBalance,
        borrowerName: borrowerInfo.name
      }));

      // Create CSV strings
      const loanCsv = new Parser().parse(loanDetails);
      const repaymentCsv = new Parser().parse(repaymentHistory);

      // Combine both CSV parts with labels
      const combinedCsv = `--- Loan Details ---\n${loanCsv}\n\n--- Repayment History ---\n${repaymentCsv}`;

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Enforce `.csv` extension to avoid collision
      const safeFilePath = filePath.endsWith('.csv') ? filePath : `${filePath}.csv`;

      // Write file
      fs.writeFileSync(safeFilePath, combinedCsv);
      resolve(safeFilePath);
    } catch (err) {
      reject(err);
    }
  });
};
