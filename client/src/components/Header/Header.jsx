import React from 'react';
import { Search, ShoppingCart, User, ChevronDown } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <img src="/logo.svg" alt="GamersStation" className="logo-icon" />
          <span className="logo-text">GamersStation</span>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <a href="/" className="nav-link active">الرئيسية</a>
          <a href="/merchants" className="nav-link">التجار</a>
          <a href="/contact" className="nav-link">تواصل معنا</a>
          <a href="/faq" className="nav-link">الأسئلة الشائعة</a>
        </nav>

        {/* Search Bar */}
        <div className="header-search">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="ابحث عن لعبة أو منتج..." 
            className="search-input"
          />
        </div>

        {/* User Actions */}
        <div className="header-actions">
          <button className="action-btn">
            <ShoppingCart size={22} />
          </button>
          <button className="action-btn user-btn">
            <User size={22} />
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;