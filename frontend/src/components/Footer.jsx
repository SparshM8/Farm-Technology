import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🌾 Farming Tech Shop</h3>
            <p>Quality agricultural products for modern farming.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>Email: info@farmingtech.com</p>
            <p>Phone: +91-XXXX-XXXX-XX</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Farming Tech Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
