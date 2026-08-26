import React from 'react';
import './Footer.css';

export default function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><a className="footer-brand" href="#home"><span>FT</span><strong>Farm Technology</strong></a><p>A considered supply desk for the work that starts before sunrise.</p><a className="footer-cta" href="#products">Explore supplies <span>→</span></a></div><div className="footer-bottom"><small>© {new Date().getFullYear()} Farm Technology. Built for field work.</small><div><a href="#products">Store</a><a href="#contact">Support</a><a href="#home">Top ↑</a></div></div></div></footer>;
}
