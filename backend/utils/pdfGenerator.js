// pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateCreditReportPDF = (creditReport, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'A4', 
      bufferPages: true,
      info: {
        Title: 'Credit Report',
        Author: 'Your Institution',
        Creator: 'PDFKit'
      }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ===== Color Palette =====
    const colors = {
      primary: '#2C3E50',      // Dark blue-gray for headings
      secondary: '#F8F9FA',    // Light gray for table row alternation
      text: '#333333',         // Dark gray for body text
      border: '#E0E0E0',       // Light gray for borders
      positive: '#27AE60',     // Green for positive values
      negative: '#E74C3C',     // Red for negative values
      warning: '#F39C12'       // Orange for warnings
    };

    // ===== Font Settings =====
    const fonts = {
      header: 'Helvetica-Bold',
      subheader: 'Helvetica-Bold',
      body: 'Helvetica',
      tableHeader: 'Helvetica-Bold'
    };

    // ===== Spacing =====
    const spacing = {
      section: 20,
      paragraph: 10,
      tableRow: 15
    };

    // ===== Helper: Draw Table =====
    const drawTable = (headers, rows, columnWidths, options = {}) => {
      const startY = doc.y;
      const headerHeight = 20;
      const rowHeight = options.rowHeight || 18;
      const cellPadding = options.cellPadding || 5;

      // Draw table headers
      doc.font(fonts.tableHeader).fontSize(10).fillColor(colors.primary);
      let x = 50;

      headers.forEach((header, i) => {
        doc.rect(x, startY, columnWidths[i], headerHeight)
           .fillAndStroke('#E0E0E0', colors.border);
        doc.text(header, x + cellPadding, startY + cellPadding, {
          width: columnWidths[i] - (cellPadding * 2),
          align: options.align || 'left'
        });
        x += columnWidths[i];
      });

      // Draw table rows
      doc.font(fonts.body).fontSize(9);
      let currentY = startY + headerHeight;

      rows.forEach((row, rowIndex) => {
        x = 50;
        let maxCellHeight = rowHeight;

        // Calculate max cell height for the row
        row.forEach((cell, colIndex) => {
          const cellHeight = doc.heightOfString(String(cell), {
            width: columnWidths[colIndex] - (cellPadding * 2)
          }) + (cellPadding * 2);
          maxCellHeight = Math.max(maxCellHeight, cellHeight);
        });

        // Draw each cell
        row.forEach((cell, colIndex) => {
          const fillColor = rowIndex % 2 === 0 ? 'white' : colors.secondary;
          doc.rect(x, currentY, columnWidths[colIndex], maxCellHeight)
             .fillAndStroke(fillColor, colors.border);

          // Handle numeric values (color-coded)
          if (typeof cell === 'number') {
            const isNegative = cell < 0;
            doc.fillColor(isNegative ? colors.negative : colors.positive);
            doc.text(cell.toFixed(2), x + cellPadding, currentY + cellPadding, {
              width: columnWidths[colIndex] - (cellPadding * 2),
              align: 'right'
            });
          } 
          // Handle status labels (e.g., "Overdue")
          else if (typeof cell === 'string' && cell.toLowerCase() === 'overdue') {
            doc.fillColor(colors.negative);
            doc.text(cell, x + cellPadding, currentY + cellPadding, {
              width: columnWidths[colIndex] - (cellPadding * 2),
              align: options.align?.[colIndex] || options.align || 'left'
            });
          }
          // Default text
          else {
            doc.fillColor(colors.text);
            doc.text(String(cell), x + cellPadding, currentY + cellPadding, {
              width: columnWidths[colIndex] - (cellPadding * 2),
              align: options.align?.[colIndex] || options.align || 'left'
            });
          }

          x += columnWidths[colIndex];
        });

        currentY += maxCellHeight;
      });

      doc.y = currentY + spacing.section;
    };

    // ===== Helper: Section Header =====
    const addSectionHeader = (text) => {
      doc.font(fonts.header)
         .fontSize(16)
         .fillColor(colors.primary)
         .text(text, { underline: true })
         .moveDown(0.5);
    };

    // ===== Cover Page =====
    doc.image(path.join(__dirname, '..', 'assets', 'images', 'LesothoFlag.png'), 50, 45, { width: 100 })
       .font(fonts.header)
       .fontSize(24)
       .fillColor(colors.primary)
       .text('CREDIT REPORT', 50, 180)
       .font(fonts.subheader)
       .fontSize(14)
       .fillColor(colors.text)
       .text(`Prepared for ${creditReport.borrowerInfo?.name || 'N/A'}`, 50, 220)
       .text(`Generated on ${new Date().toLocaleDateString()}`, 50, 240)
       .addPage();

    // ===== Borrower Information =====
    addSectionHeader('Borrower Information');
    const borrowerInfo = [
      ['Name:', creditReport.borrowerInfo?.name || 'N/A'],
      ['Email:', creditReport.borrowerInfo?.email || 'N/A'],
      ['Phone:', creditReport.borrowerInfo?.phone || 'N/A'],
      ['Borrower ID:', creditReport.borrowerInfo?.borrowerId || 'N/A'],
      ['Report Date:', new Date().toLocaleDateString()]
    ];
    drawTable(['Field', 'Value'], borrowerInfo, [150, 350]);

    // ===== Credit Summary =====
    addSectionHeader('Credit Summary');
    const creditSummary = [
      ['Credit Score:', creditReport.summary?.creditScore || 'N/A'],
      ['Total Loans:', creditReport.summary?.totalLoans || '0'],
      ['Total Borrowed:', `${(creditReport.summary?.totalBorrowed || 0).toFixed(2)} M`],
      ['Total Repaid:', `${(creditReport.summary?.totalRepaid || 0).toFixed(2)} M`],
      ['Total Outstanding:', `${(creditReport.summary?.totalOutstanding || 0).toFixed(2)} M`],
      ['Last Activity:', creditReport.summary?.lastActivityDate || 'N/A']
    ];
    drawTable(['Metric', 'Value'], creditSummary, [150, 350]);

    // ===== Loan Details =====
    if (creditReport.loanDetails?.length > 0) {
      addSectionHeader('Loan Details');
      const loanHeaders = ['Loan ID', 'Amount', 'Interest', 'Purpose', 'Status', 'Due', 'Total Repayment'];
      const loanRows = creditReport.loanDetails.map(loan => [
        String(loan.loanId).slice(-6),
        `${loan.amount.toFixed(2)} M`,
        `${loan.interestRate}%`,
        loan.purpose.substring(0, 20) + (loan.purpose.length > 20 ? '...' : ''),
        loan.status,
        loan.repaymentStatus,
        `${loan.totalRepaymentAmount.toFixed(2)} M`
      ]);
      drawTable(loanHeaders, loanRows, [60, 70, 50, 120, 60, 80, 80], {
        align: ['left', 'right', 'right', 'left', 'left', 'left', 'right']
      });
    }

    // ===== Repayment History =====
    if (creditReport.repaymentHistory?.length > 0) {
      doc.addPage();
      addSectionHeader('Repayment History');
      const repaymentHeaders = ['Date', 'Amount', 'Method', 'Balance'];
      const repaymentRows = creditReport.repaymentHistory.map(payment => [
        new Date(payment.date).toLocaleDateString(),
        parseFloat(payment.amount),
        payment.method,
        payment.remainingBalance ? parseFloat(payment.remainingBalance) : 'N/A'
      ]);
      drawTable(repaymentHeaders, repaymentRows, [80, 80, 80, 80], {
        align: ['left', 'right', 'left', 'right']
      });
    }

    // ===== Credit Analysis =====
    doc.addPage();
    addSectionHeader('Credit Analysis');
    doc.font(fonts.body)
       .fontSize(11)
       .fillColor(colors.text)
       .text('This credit report provides a comprehensive overview of the borrower\'s financial activity with our institution. Key observations:', {
         indent: 20,
         align: 'justify'
       })
       .moveDown(0.5)
       .text(`• The borrower currently has ${creditReport.summary?.totalOutstanding > 0 ? 'an outstanding balance' : 'no outstanding balances'}`)
       .text(`• Their credit score of ${creditReport.summary?.creditScore || 'N/A'} is ${
          creditReport.summary?.creditScore > 700 ? 'good' : 
          creditReport.summary?.creditScore > 600 ? 'fair' : 'poor'
        }`)
       .text(`• ${creditReport.repaymentHistory?.length || 0} recorded payments have been made`)
       .moveDown(1)
       .text('This concludes the summary of the borrower\'s financial activities.', {
         indent: 20,
         align: 'justify'
       });

    // ===== Footer =====
    doc.fontSize(8)
       .fillColor(colors.text)
       .text(`Confidential - Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 30);

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', (err) => reject(err));
  });
};