import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaWhatsapp, FaInfoCircle, FaMoneyBillWave, FaClock, FaThumbsUp } from 'react-icons/fa';
import { MdEmail, MdLock } from 'react-icons/md';
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

const Navbar = ({ activeLink, handleLoanRedirect, handleLanderClick }) => (
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
      <li><button onClick={handleLoanRedirect} className="btn-highlight">
      <MdLock /> Borrower Login
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
  const navigate = useNavigate();

  const handleLearnMoreClick = () => navigate('/loan-guide');
  const handleLoanRedirect = () => navigate('/signin');
  const handleLanderClick = () => navigate('/login');

  return (
    <div className="borrower-site">
      <TopContactStrip />
      <Navbar 
        activeLink="home" 
        handleLoanRedirect={handleLoanRedirect}
        handleLanderClick={handleLanderClick}
      />
      <HeroSection handleLearnMoreClick={handleLearnMoreClick} />
      <InfoBanner handleLearnMoreClick={handleLearnMoreClick} />
      <LoanFeatures />
      <TestimonialsSection />
      <FAQPreview navigate={navigate} />
      <Footer />
    </div>
  );
};

export default BorrowerSite;
