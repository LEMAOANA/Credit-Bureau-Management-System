import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './BorrowerValidation.css';

const BorrowerValidation = () => {
  const [nationalId, setNationalId] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateNationalId = (id) => /^\d{10,}$/.test(id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!nationalId.trim()) {
      setError('National ID cannot be empty.');
      return;
    }

    if (!validateNationalId(nationalId)) {
      setError('Please enter a valid National ID (minimum 10 digits).');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get('http://localhost:5001/api/borrowers');
      const borrowers = response.data?.data || [];

      const found = borrowers.find((b) => b.nationalId === nationalId);

      if (found) {
        navigate(`/loan-application/${found._id}`, { state: { ...found } });
      } else {
        setInfo('No account found with this ID. Redirecting to registration...');
        setTimeout(() => {
          navigate('/register', { state: { nationalId } });
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError('Server error: Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="borrower-validation-container">
      <h2>Login using National ID</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter National ID (10+ digits)"
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Login'}
        </button>
        {error && <p className="error">{error}</p>}
        {info && <p className="info">{info}</p>}
      </form>

      <p>
        New user? If your ID isn't found, you’ll be redirected to{' '}
        <Link to="/register">register an account</Link>.
      </p>
    </div>
  );
};

export default BorrowerValidation;
