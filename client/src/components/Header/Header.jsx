import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, ChevronDown, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { authService } from '../../services/authService';
import './Header.css';

// Memoized navigation link component
const NavLink = memo(({ to, isActive, onClick, children }) => (
  <Link
    to={to}
    className={`nav-link ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {children}
  </Link>
));

NavLink.displayName = 'NavLink';

// Memoized mobile navigation link component
const MobileNavLink = memo(({ to, isActive, onClick, children }) => (
  <Link
    to={to}
    className={`mobile-nav-link ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {children}
  </Link>
));

MobileNavLink.displayName = 'MobileNavLink';

const Header = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  // Update active link based on current location
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      if (authStatus) {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    };

    checkAuth();
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth);
    
    // Listen for custom auth events
    const handleAuthChange = (event) => {
      if (event.detail && event.detail.type === 'login') {
        checkAuth();
      }
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prevState => {
      const newState = !prevState;
      
      // Prevent body scroll when menu is open
      if (newState) {
        document.body.classList.add('mobile-menu-open');
      } else {
        document.body.classList.remove('mobile-menu-open');
      }
      
      return newState;
    });
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, []);

  const handleLinkClick = useCallback((path) => {
    setActiveLink(path);
  }, []);
  
  const handleMobileLinkClick = useCallback((path) => {
    setActiveLink(path);
    toggleMobileMenu();
  }, [toggleMobileMenu]);

  const handleLogout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  }, [navigate]);
  
  // Memoize navigation items
  const navigationItems = useMemo(() => [
    { path: '/', label: t('header.home') },
    { path: '/contact', label: t('header.contact') },
    { path: '/faq', label: t('header.faq') }
  ], [t]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Language Switcher - Always on left */}
       

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label={t('header.toggleNavigation')}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="header-logo" onClick={() => handleLinkClick('/')}>
          <img src="/logo.svg" alt="GamersStation" className="logo-icon" loading="eager" />
          <span className="logo-text">GamersStation</span>
        </Link>

        {/* Navigation */}
        <nav className="header-nav">
          {navigationItems.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              isActive={activeLink === path}
              onClick={() => handleLinkClick(path)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="header-search">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            className="search-input"
          />
        </div>

        {/* User Actions */}
        <div className="header-actions">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <div className="auth-dropdown">
              <button className="action-btn user-btn">
                <div className="user-profile-img">
                  <User size={22} />
                </div>
                {currentUser?.username && (
                  <span className="user-name">{currentUser.username}</span>
                )}
                <ChevronDown size={16} />
              </button>
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  <User size={18} />
                  <span>{t('header.myProfile')}</span>
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <LogIn size={18} />
                  <span>{t('header.logout')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login-btn">
                <LogIn size={16} />
                <span>{t('header.login')}</span>
              </Link>
              <Link to="/register" className="auth-btn register-btn">
                <UserPlus size={16} />
                <span>{t('header.register')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {/* Mobile Search */}
          <div className="mobile-search">
            <Search className="mobile-search-icon" size={20} />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              className="mobile-search-input"
            />
          </div>

          {/* Mobile Navigation */}
          <nav className="mobile-nav">
            {navigationItems.map(({ path, label }) => (
              <MobileNavLink
                key={path}
                to={path}
                isActive={activeLink === path}
                onClick={() => handleMobileLinkClick(path)}
              >
                {label}
              </MobileNavLink>
            ))}
          </nav>

          {/* Mobile User Section */}
          <div className="mobile-user-section">
            {isAuthenticated ? (
              <>
                <button className="mobile-action-btn">
                  <div className="mobile-user-profile-img">
                    <User size={20} />
                  </div>
                  <span>{currentUser?.username || t('header.myAccount')}</span>
                </button>
                <button onClick={handleLogout} className="mobile-action-btn logout-btn">
                  <LogIn size={20} />
                  <span>{t('header.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-auth-btn mobile-login-btn" onClick={toggleMobileMenu}>
                  <LogIn size={20} />
                  <span>{t('header.login')}</span>
                </Link>
                <Link to="/register" className="mobile-auth-btn mobile-register-btn" onClick={toggleMobileMenu}>
                  <UserPlus size={20} />
                  <span>{t('header.register')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;