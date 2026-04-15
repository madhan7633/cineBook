import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">CineBook</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Movies
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/bookings" className="nav-link" onClick={() => setMenuOpen(false)}>
                My Bookings
              </Link>
              <div className="nav-user">
                <span className="nav-user-name">👤 {user?.name}</span>
                <button onClick={handleLogout} className="btn btn-sm btn-secondary" id="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-sm btn-secondary" onClick={() => setMenuOpen(false)} id="login-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)} id="register-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          id="hamburger-btn"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
