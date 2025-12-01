import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, ChevronDown, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const location = useLocation();

  // Update active link based on current location
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

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
  
  // Memoize navigation items
  const navigationItems = useMemo(() => [
    { path: '/', label: t('header.home') },
    { path: '/merchants', label: t('header.merchants') },
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
        <div className="header-logo">
          <img src="/logo.svg" alt="GamersStation" className="logo-icon" loading="eager" />
          <span className="logo-text">GamersStation</span>
        </div>

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
          <button className="action-btn user-btn">
            <User size={22} />
            {/* <ChevronDown size={16} /> */}
          </button>
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
            <button className="mobile-action-btn">
              <User size={20} />
              <span>{t('header.myAccount')}</span>
            </button>
             
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;