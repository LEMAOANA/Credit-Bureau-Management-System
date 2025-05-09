import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './BorrowerRegistration.css';

const BorrowerRegistration = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+266',  // Pre-fill for Lesotho numbers
    nationalId: '',
    loanAmount: '',
    loanPurpose: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { name, email, phone, nationalId, loanAmount, loanPurpose } = form;

    if (!name || !email || !phone || !nationalId || !loanAmount || !loanPurpose) {
      return 'All fields are required.';
    }
    if (!/^\d{10,}$/.test(nationalId)) {
      return 'National ID must be at least 10 digits.';
    }
    if (!/^\+266\d{8}$/.test(phone)) {
      return 'Phone number must start with +266 and be followed by 8 digits.';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Invalid email format.';
    }
    if (isNaN(loanAmount) || Number(loanAmount) < 100) {
      return 'Startup Loan Amount must be at least M100.';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const newBorrower = {
      ...form,
      borrowerId: uuidv4(),
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    try {
      await axios.post('http://localhost:5001/api/borrowers', newBorrower);

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Could not register borrower. Please try again.');
    }
  };

  return (
    <div className="borrower-registration-container">
      <h2>Borrower Startup Registration</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone Number (e.g., +26612345678)"
          value={form.phone}
          onChange={(e) => {
            if (/^\+266\d{0,8}$/.test(e.target.value)) {
              handleChange(e);
            }
          }}
        />
        <input
          name="nationalId"
          placeholder="National ID (10+ digits)"
          value={form.nationalId}
          onChange={handleChange}
        />
        <input
          name="loanAmount"
          placeholder="Startup Loan Amount (Minimum M100)"
          type="number"
          value={form.loanAmount}
          onChange={handleChange}
        />
        <input
          name="loanPurpose"
          placeholder="Loan Purpose (e.g., School Fees)"
          value={form.loanPurpose}
          onChange={handleChange}
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account? <Link to="/signin">Sign in here</Link>.
      </p>
    </div>
  );
};

export default BorrowerRegistration;
