import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down 200px
      setShowButton(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Hide on chat pages
  if (location.pathname.startsWith('/chat')) {
    return null;
  }

  if (!showButton) {
    return null;
  }

  return (
    <button
      className="scroll-to-top-btn"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title={t('pages.productDetails.scrollToTop')}
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default ScrollToTop;