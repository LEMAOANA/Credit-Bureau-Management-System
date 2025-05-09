import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import './LoanApplication.css';

const LoanApplication = () => {
  const { borrowerId } = useParams();
  const location = useLocation();
  const { state } = location;

  const [loans, setLoans] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repaymentFormData, setRepaymentFormData] = useState({
    loanId: '',
    paymentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'Cash',
    paymentReference: '',
    notes: '',
  });

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    loanTerm: '',
    repaymentStartDate: '',
    collateral: '',
    notes: '',
  });

  useEffect(() => {
    if (!state) {
      setError('Borrower details are missing.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch loans
        const loanRes = await axios.get(`http://localhost:5001/api/loans/borrower/${borrowerId}`);
        setLoans(Array.isArray(loanRes.data) ? loanRes.data : []);

        // Fetch repayments
        const repaymentRes = await axios.get(`http://localhost:5001/api/repayments/borrower/${borrowerId}`);
        // Handle both possible response formats
        const repaymentsData = Array.isArray(repaymentRes.data) 
          ? repaymentRes.data 
          : (Array.isArray(repaymentRes.data?.data) ? repaymentRes.data.data : []);
        setRepayments(repaymentsData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch borrower data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [borrowerId, state]);

  const handleApplyLoan = () => {
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitLoanApplication = async () => {
    try {
      setLoading(true);
      const payload = {
        borrower: borrowerId,
        amount: Number(formData.amount),
        purpose: formData.purpose,
        interestRate: 20,
        loanTerm: Number(formData.loanTerm),
        repaymentStartDate: formData.repaymentStartDate,
        status: 'Pending',
        repaymentStatus: 'Not Started',
        collateral: formData.collateral,
        notes: formData.notes,
      };

      const response = await axios.post('http://localhost:5001/api/loans', payload);
      setLoans([response.data, ...loans]);
      setIsModalOpen(false);
      setFormData({
        amount: '',
        purpose: '',
        loanTerm: '',
        repaymentStartDate: '',
        collateral: '',
        notes: '',
      });
    } catch (error) {
      console.error('Loan application error:', error);
      setError('Failed to apply for loan.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepayButtonClick = (loan) => {
    setSelectedLoan(loan);
    setRepaymentFormData({
      ...repaymentFormData,
      loanId: loan._id,
    });
  };

  const handleRepaymentChange = (e) => {
    const { name, value } = e.target;
    setRepaymentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRepayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        borrower: borrowerId, // Include borrower ID in payload
        loan: repaymentFormData.loanId,
        paymentAmount: parseFloat(repaymentFormData.paymentAmount),
        paymentDate: new Date(repaymentFormData.paymentDate).toISOString(),
        paymentType: repaymentFormData.paymentType,
        paymentReference: repaymentFormData.paymentReference,
        notes: repaymentFormData.notes,
      };

      const response = await axios.post('http://localhost:5001/api/repayments', payload);
      setRepayments([response.data, ...repayments]);
      setSelectedLoan(null);
      setRepaymentFormData({
        loanId: '',
        paymentAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentType: 'Cash',
        paymentReference: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to submit repayment:', error);
      setError('Failed to submit repayment.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading borrower data...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="loan-application-container">
      <h2>Loan Application</h2>

      {/* Borrower Info */}
      <div className="borrower-details">
        <p><strong>Name:</strong> {state?.name}</p>
        <p><strong>Email:</strong> {state?.email}</p>
        <p><strong>Phone:</strong> {state?.phone}</p>
        <p><strong>National ID:</strong> {state?.nationalId}</p>
      </div>

      <button className="btn-highlight" onClick={handleApplyLoan}>Apply for Loan</button>

      {/* Loan Table */}
      <h3>Loan Details</h3>
      {loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        <table className="loan-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Amount</th>
              <th>Interest</th>
              <th>Term</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Repayment</th>
              <th>Total</th>
              <th>Start Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={`loan-${loan._id}`}>
                <td>{loan._id}</td>
                <td>M{loan.amount}</td>
                <td>{loan.interestRate}%</td>
                <td>{loan.loanTerm} mo</td>
                <td>{loan.purpose}</td>
                <td>{loan.status}</td>
                <td>{loan.repaymentStatus}</td>
                <td>M{loan.totalRepaymentAmount}</td>
                <td>{new Date(loan.repaymentStartDate).toLocaleDateString()}</td>
                <td>
                  {loan.status.toLowerCase() === 'approved' ? (
                    <button 
                      className="btn-highlight small"
                      onClick={() => handleRepayButtonClick(loan)}
                    >
                      Repay
                    </button>
                  ) : (
                    <span className="muted-text">Not Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Repayments Table */}
      <h3>Repayments</h3>
      {repayments.length === 0 ? (
        <p>No repayments found.</p>
      ) : (
        <table className="loan-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Loan ID</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {repayments.map((rep) => (
              <tr key={`repayment-${rep._id}`}>
                <td>{rep._id}</td>
                <td>{rep.loan?._id || rep.loan}</td> {/* Handle both nested and direct loan ID */}
                <td>M{rep.paymentAmount}</td>
                <td>{new Date(rep.paymentDate).toLocaleDateString()}</td>
                <td>{rep.paymentType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Repayment Form */}
      {selectedLoan && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="close-button"
              onClick={() => setSelectedLoan(null)}
            >
              &times;
            </button>
            <h3>Repayment for Loan M{selectedLoan.amount}</h3>
            <form onSubmit={handleSubmitRepayment}>
              <input type="hidden" name="borrower" value={borrowerId} />
              
              <div className="form-group">
                <label>Payment Amount (M):</label>
                <input
                  type="number"
                  name="paymentAmount"
                  value={repaymentFormData.paymentAmount}
                  onChange={handleRepaymentChange}
                  required
                  min="1"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Payment Date:</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={repaymentFormData.paymentDate}
                  onChange={handleRepaymentChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Type:</label>
                <select
                  name="paymentType"
                  value={repaymentFormData.paymentType}
                  onChange={handleRepaymentChange}
                >
                  {['Cash', 'Transfer', 'Cheque', 'Mobile Money'].map((type) => (
                    <option key={`payment-type-${type}`} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Payment Reference:</label>
                <input
                  type="text"
                  name="paymentReference"
                  value={repaymentFormData.paymentReference}
                  onChange={handleRepaymentChange}
                />
              </div>

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  name="notes"
                  value={repaymentFormData.notes}
                  onChange={handleRepaymentChange}
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-highlight">Submit Repayment</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setSelectedLoan(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Application Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="close-button"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h3>Apply for Loan</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Amount:</label>
                <input 
                  type="number" 
                  name="amount" 
                  placeholder="Amount" 
                  value={formData.amount} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Purpose:</label>
                <input 
                  type="text" 
                  name="purpose" 
                  placeholder="Purpose" 
                  value={formData.purpose} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Loan Term (months):</label>
                <input 
                  type="number" 
                  name="loanTerm" 
                  placeholder="Loan Term (months)" 
                  value={formData.loanTerm} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Repayment Start Date:</label>
                <input 
                  type="date" 
                  name="repaymentStartDate" 
                  value={formData.repaymentStartDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Collateral (optional):</label>
                <input 
                  type="text" 
                  name="collateral" 
                  placeholder="Collateral (optional)" 
                  value={formData.collateral} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label>Notes (optional):</label>
                <textarea 
                  name="notes" 
                  placeholder="Notes (optional)" 
                  value={formData.notes} 
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <p><strong>Interest Rate:</strong> 20% (fixed)</p>
              
              <div className="form-actions">
                <button className="btn-highlight" onClick={handleSubmitLoanApplication}>Submit</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanApplication;