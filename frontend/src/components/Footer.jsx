import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">🎬 CineBook</span>
          <p className="footer-tagline">Your premium movie booking experience</p>
        </div>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
        <div className="footer-bottom">
          <span>© 2024 CineBook. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
