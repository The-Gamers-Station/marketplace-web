import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, ChevronDown, Menu, X, LogIn, UserPlus, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import authService from '../../services/authService';
import messagingService from '../../services/messagingService';
import './Header.css';

// Memoized navigation link component - Using React Router Link for SPA navigation
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

// Memoized mobile navigation link component - Using React Router Link for SPA navigation
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
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [mobileSearchValue, setMobileSearchValue] = useState('');
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

  // Fetch unread messages count
  useEffect(() => {
    let unsubscribe;
    
    const fetchUnreadCount = async () => {
      if (isAuthenticated) {
        try {
          const count = await messagingService.getUnreadCount();
          setUnreadMessagesCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
          setUnreadMessagesCount(0);
        }
      } else {
        setUnreadMessagesCount(0);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages to update count in real-time
    if (isAuthenticated) {
      messagingService.subscribeToMessages((message) => {
        if (!message.isOwn) {
          setUnreadMessagesCount(prev => prev + 1);
        }
      }).then(unsub => {
        unsubscribe = unsub;
      }).catch(error => {
        console.error('Error subscribing to messages:', error);
      });
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isAuthenticated]);

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

  // Handle search submission
  const handleSearchSubmit = useCallback((e, isMobile = false) => {
    e.preventDefault();
    const query = isMobile ? mobileSearchValue : searchValue;
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      // Clear search input after navigation
      if (isMobile) {
        setMobileSearchValue('');
        toggleMobileMenu();
      } else {
        setSearchValue('');
      }
    }
  }, [navigate, searchValue, mobileSearchValue, toggleMobileMenu]);

  // Handle Enter key in search input
  const handleSearchKeyPress = useCallback((e, isMobile = false) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e, isMobile);
    }
  }, [handleSearchSubmit]);
  
  // Memoize navigation items
  const navigationItems = useMemo(() => [
    { path: '/', label: t('header.home') },
    { path: '/products', label: t('header.products') },
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

        {/* Logo - Using React Router Link for SPA navigation */}
        <Link to="/" className="header-logo">
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
        <form className="header-search" onSubmit={(e) => handleSearchSubmit(e)}>
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            className="search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => handleSearchKeyPress(e)}
          />
        </form>

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
                {unreadMessagesCount > 0 && (
                  <span className="user-unread-badge">{unreadMessagesCount}</span>
                )}
              </button>
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  <User size={18} />
                  <span>{t('header.myProfile')}</span>
                </Link>
                <Link to="/profile?tab=messages" className="dropdown-item">
                  <MessageCircle size={18} />
                  <span>{t('chat.messages')}</span>
                  {unreadMessagesCount > 0 && (
                    <span className="dropdown-badge">{unreadMessagesCount}</span>
                  )}
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
          <form className="mobile-search" onSubmit={(e) => handleSearchSubmit(e, true)}>
            <Search className="mobile-search-icon" size={20} />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              className="mobile-search-input"
              value={mobileSearchValue}
              onChange={(e) => setMobileSearchValue(e.target.value)}
              onKeyPress={(e) => handleSearchKeyPress(e, true)}
            />
          </form>

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
                <Link to="/profile" className="mobile-action-btn" onClick={toggleMobileMenu}>
                  <div className="mobile-user-profile-img">
                    <User size={20} />
                  </div>
                  <span>{currentUser?.username || t('header.myAccount')}</span>
                </Link>
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