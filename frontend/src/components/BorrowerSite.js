import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaWhatsapp, FaInfoCircle, FaTimes, FaCheckCircle, FaMoneyBillWave, FaClock, FaThumbsUp } from 'react-icons/fa';
import { MdEmail, MdLock, MdOutlineAccountBalance, MdPayment } from 'react-icons/md';
import { IoIosPeople } from 'react-icons/io';
import './BorrowerSite.css';

const HeroSection = ({ handleLearnMoreClick }) => (
  <div className="hero-section">
    <div className="hero-content">
      <h1>Get the Loan You Need</h1>
      <p className="hero-subtitle">Fast, transparent lending solutions in Lesotho</p>
      <button onClick={handleLearnMoreClick} className="btn-highlight">
        Learn More
      </button>
    </div>
  </div>
);

const InfoBanner = ({ handleLearnMoreClick }) => (
  <div className="info-banner">
    <div className="banner-content">
      <FaInfoCircle className="banner-icon" />
      <p>Quick and easy loan application process</p>
      <button onClick={handleLearnMoreClick} className="btn-learn-more">
        Learn More
      </button>
    </div>
  </div>
);

const LoanFeatures = () => (
  <div className="loan-features">
    <h2>Our Loan Features</h2>
    <div className="features-grid">
      <div className="feature-card">
        <div className="feature-icon">
          <FaMoneyBillWave />
        </div>
        <h3>Competitive Rates</h3>
        <p>Enjoy low interest rates tailored for your needs</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
          <FaClock />
        </div>
        <h3>Flexible Terms</h3>
        <p>Choose repayment periods from 1 to 24 months</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
          <FaThumbsUp />
        </div>
        <h3>Quick Approval</h3>
        <p>Get decisions within 24 hours of application</p>
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => (
  <div className="testimonials">
    <h2>What Our Customers Say</h2>
    <div className="testimonials-grid">
      <div className="testimonial-card">
        <div className="testimonial-quote">
          "The loan process was so easy and quick. I got the money I needed within a day!"
        </div>
        <div className="testimonial-author">
          <div className="author-avatar"></div>
          <div className="author-info">
            <p className="author-name">Thabo M.</p>
            <p className="author-location">Maseru</p>
          </div>
        </div>
      </div>
      <div className="testimonial-card">
        <div className="testimonial-quote">
          "Excellent service and transparent terms. Highly recommended!"
        </div>
        <div className="testimonial-author">
          <div className="author-avatar"></div>
          <div className="author-info">
            <p className="author-name">Mamello K.</p>
            <p className="author-location">Leribe</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FAQPreview = ({ navigate }) => (
  <div className="faq-preview">
    <h2>Frequently Asked Questions</h2>
    <div className="faq-sample">
      <h4>What documents do I need to apply?</h4>
      <p>You'll need your ID, proof of income, and bank statements.</p>
    </div>
    <button onClick={() => navigate('/faqs')} className="btn-highlight">
      View All FAQs
    </button>
  </div>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-section">
        <h4>Contact Us</h4>
        <p><FaPhone /> +266 5935 1022</p>
        <p><FaWhatsapp /> +266 55872557</p>
        <p><MdEmail /> info@creditbureauls.com</p>
      </div>
      <div className="footer-section">
        <h4>Quick Links</h4>
        <a href="/faqs">FAQs</a>
        <a href="/loan-guide">Loan Guide</a>
        <a href="/contact">Contact</a>
      </div>
      <div className="footer-section">
        <h4>Legal</h4>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} Credit Bureau Lesotho. All rights reserved.</p>
    </div>
  </footer>
);

const TopContactStrip = () => (
  <div className="top-contact">
    <div className="contact-info">
      <span><FaPhone /> +266 5935 1022</span>
      <span><FaWhatsapp /> +266 55872557 / +266 58902892</span>
      <span><MdEmail /> info@creditbureauls.com</span>
    </div>
  </div>
);

const LoanApplicationForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    phone: '',
    email: '',
    loanAmount: '',
    repaymentPeriod: '6',
    purpose: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmissionStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setSubmissionStatus('success');
    }, 1500);
  };

  if (submissionStatus === 'success') {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <h4>Application Submitted Successfully!</h4>
            <p>Your loan application has been received.</p>
            <p>We'll review your information and contact you shortly.</p>
            <div className="application-summary">
              <h5>Application Summary</h5>
              <p><span>Name:</span> <strong>{formData.fullName}</strong></p>
              <p><span>Loan Amount:</span> <strong>M{formData.loanAmount}</strong></p>
              <p><span>Repayment Period:</span> <strong>{formData.repaymentPeriod} months</strong></p>
            </div>
            <button onClick={onClose} className="btn-highlight">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Apply for a Loan</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              required 
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label>ID Number</label>
            <input 
              type="text" 
              name="idNumber" 
              value={formData.idNumber} 
              onChange={handleChange} 
              required 
              placeholder="Enter your ID number"
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="Enter your email address"
            />
          </div>
          
          <div className="form-group">
            <label>Loan Amount (M)</label>
            <input 
              type="number" 
              name="loanAmount" 
              value={formData.loanAmount} 
              onChange={handleChange} 
              min="1000" 
              max="150000" 
              required 
              placeholder="Enter desired loan amount"
            />
          </div>
          
          <div className="form-group">
            <label>Repayment Period (months)</label>
            <select 
              name="repaymentPeriod" 
              value={formData.repaymentPeriod} 
              onChange={handleChange}
            >
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Loan Purpose</label>
            <textarea 
              name="purpose" 
              value={formData.purpose} 
              onChange={handleChange} 
              required 
              placeholder="Briefly describe the purpose of your loan"
            />
          </div>
          
          <button type="submit" className="btn-highlight">
            {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Navbar = ({ activeLink, handleLoanFormToggle, handleLanderClick }) => (
  <nav className="navbar">
    <div className="header-left">
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Flag_of_Lesotho.svg" 
        alt="Lesotho Flag" 
        className="lesotho-flag"
      />
      <div className="system-info">
        <h1 className="system-title">Credit Bureau Web</h1>
        <p className="system-subtitle">Empowering Financial Transparency in Lesotho</p>
      </div>
    </div>
    <ul className="navbar-links">
      <li><a href="/" className={activeLink === 'home' ? 'active' : ''}>Home</a></li>
      <li><a href="/faqs" className={activeLink === 'faqs' ? 'active' : ''}>FAQs</a></li>
      <li><a href="/loan-guide" className={activeLink === 'guide' ? 'active' : ''}>Loan Guide</a></li>
      <li><a href="/contact" className={activeLink === 'contact' ? 'active' : ''}>Contact Us</a></li>
      <li><button onClick={handleLoanFormToggle} className="btn-highlight">
        Apply for Loan Now
      </button></li>
      <li>
        <button onClick={handleLanderClick} className="btn-highlight">
          <MdLock /> Lender Login
        </button>
      </li>
    </ul>
  </nav>
);

const BorrowerSite = () => {
  const [showLoanForm, setShowLoanForm] = useState(false);
  const navigate = useNavigate();

  const handleLearnMoreClick = () => navigate('/loan-guide');
  const handleLoanFormToggle = () => setShowLoanForm(!showLoanForm);
  const handleLanderClick = () => navigate('/login');

  return (
    <div className="borrower-site">
      <TopContactStrip />
      <Navbar 
        activeLink="home" 
        handleLoanFormToggle={handleLoanFormToggle} 
        handleLanderClick={handleLanderClick} 
      />
      <HeroSection handleLearnMoreClick={handleLearnMoreClick} />
      <InfoBanner handleLearnMoreClick={handleLearnMoreClick} />
      <LoanFeatures />
      <TestimonialsSection />
      <FAQPreview navigate={navigate} />
      <Footer />
      
      {showLoanForm && (
        <LoanApplicationForm onClose={() => setShowLoanForm(false)} />
      )}
    </div>
  );
};

export default BorrowerSite;