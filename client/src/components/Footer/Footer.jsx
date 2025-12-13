import React, { useState, useEffect } from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  Gamepad2,
  Shield,
  Truck,
  CreditCard,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    quickLinks: false,
    customerService: false,
    legal: false
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSection = (section) => {
    if (isMobile) {
      setCollapsedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription submitted');
  };

  return (
    <footer className="footer">
      {/* Features Section */}
      <div className="footer-features">
        <div className="footer-container">
          <div className="features-grid">
            <div className="feature-item">
              <Gamepad2 className="feature-icon" size={24} />
              <h4>{t('footer.features.latestGames')}</h4>
              <p>{t('footer.features.latestGamesDesc')}</p>
            </div>
            <div className="feature-item">
              <Shield className="feature-icon" size={24} />
              <h4>{t('footer.features.securePayment')}</h4>
              <p>{t('footer.features.securePaymentDesc')}</p>
            </div>
            <div className="feature-item">
              <Truck className="feature-icon" size={24} />
              <h4>{t('footer.features.fastShipping')}</h4>
              <p>{t('footer.features.fastShippingDesc')}</p>
            </div>
            <div className="feature-item">
              <CreditCard className="feature-icon" size={24} />
              <h4>{t('footer.features.multiplePayment')}</h4>
              <p>{t('footer.features.multiplePaymentDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-content">
            {/* Company Info */}
            <div className="footer-section footer-about">
              <a href="/" className="footer-logo">
                <img src="/logo.svg" alt="GamersStation" className="footer-logo-icon" />
                <span className="footer-logo-text">GamersStation</span>
              </a>
              <p className="footer-description">
                {t('footer.about.description')}
              </p>
              <div className="social-links">
                <a href="https://www.facebook.com/GamersStationApp" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <Facebook size={18} />
                </a>
                <a href="https://www.twitter.com/GamersStationApp" className="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                  <Twitter size={18} />
                </a>
                <a href="https://www.instagram.com/GamersStationApp" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <Instagram size={18} />
                </a>
                <a href="https://www.youtube.com/GamersStationApp" className="social-link" aria-label="Youtube" target="_blank" rel="noopener noreferrer">
                  <Youtube size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3
                className={`footer-title ${isMobile ? 'mobile-toggle' : ''} ${collapsedSections.quickLinks ? 'collapsed' : ''}`}
                onClick={() => toggleSection('quickLinks')}
                style={isMobile ? { cursor: 'pointer' } : {}}
              >
                {t('footer.quickLinks.title')}
                {isMobile && (
                  <ChevronDown
                    size={14}
                    style={{
                      transform: collapsedSections.quickLinks ? 'rotate(-90deg)' : 'rotate(0)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                )}
              </h3>
              <ul className={`footer-links ${isMobile && collapsedSections.quickLinks ? 'mobile-collapsed' : ''}`}>
                <li><a href="/">{t('footer.quickLinks.home')}</a></li>
                <li><a href="/merchants">{t('footer.quickLinks.merchants')}</a></li>
                <li><a href="/categories">{t('footer.quickLinks.categories')}</a></li>
                <li><a href="/offers">{t('footer.quickLinks.offers')}</a></li>
                <li><a href="/new-arrivals">{t('footer.quickLinks.newArrivals')}</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="footer-section">
              <h3
                className={`footer-title ${isMobile ? 'mobile-toggle' : ''} ${collapsedSections.customerService ? 'collapsed' : ''}`}
                onClick={() => toggleSection('customerService')}
                style={isMobile ? { cursor: 'pointer' } : {}}
              >
                {t('footer.customerService.title')}
                {isMobile && (
                  <ChevronDown
                    size={14}
                    style={{
                      transform: collapsedSections.customerService ? 'rotate(-90deg)' : 'rotate(0)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                )}
              </h3>
              <ul className={`footer-links ${isMobile && collapsedSections.customerService ? 'mobile-collapsed' : ''}`}>
                <li><a href="/faq">{t('footer.customerService.faq')}</a></li>
                <li><a href="/contact">{t('footer.customerService.contact')}</a></li>
                <li><a href="/shipping">{t('footer.customerService.shipping')}</a></li>
                <li><a href="/returns">{t('footer.customerService.returns')}</a></li>
                <li><a href="/warranty">{t('footer.customerService.warranty')}</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-section">
              <h3
                className={`footer-title ${isMobile ? 'mobile-toggle' : ''} ${collapsedSections.legal ? 'collapsed' : ''}`}
                onClick={() => toggleSection('legal')}
                style={isMobile ? { cursor: 'pointer' } : {}}
              >
                {t('footer.legal.title')}
                {isMobile && (
                  <ChevronDown
                    size={14}
                    style={{
                      transform: collapsedSections.legal ? 'rotate(-90deg)' : 'rotate(0)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                )}
              </h3>
              <ul className={`footer-links ${isMobile && collapsedSections.legal ? 'mobile-collapsed' : ''}`}>
                <li><a href="/terms">{t('footer.legal.terms')}</a></li>
                <li><a href="/privacy">{t('footer.legal.privacy')}</a></li>
                <li><a href="/cookies">{t('footer.legal.cookies')}</a></li>
                <li><a href="/about">{t('footer.legal.about')}</a></li>
              </ul>
            </div>

            {/* Newsletter & Contact */}
            <div className="footer-section footer-contact">
              <h3 className="footer-title">{t('footer.contact.title')}</h3>
              <div className="contact-items">
                <div className="contact-item">
                  <Mail size={16} />
                  <span>contact@thegamersstation.com</span>
                </div>
                <div className="contact-item">
                  <MapPin size={16} />
                  <span>الرياض</span>
                </div>
              </div>
              
              <div className="newsletter">
                <h4>{t('footer.contact.newsletterTitle')}</h4>
                <p>{t('footer.contact.newsletterDesc')}</p>
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <input
                    type="email"
                    placeholder={t('footer.contact.emailPlaceholder')}
                    className="newsletter-input"
                    required
                    dir="ltr"
                  />
                  <button type="submit" className="newsletter-btn" aria-label={t('footer.contact.subscribe')}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="footer-payment">
        <div className="footer-container">
          <div className="payment-section">
            <span className="payment-label">{t('footer.payment.title')}</span>
            <div className="payment-methods">
              <div className="payment-icon-wrapper">
                <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="50" height="30" rx="4" fill="#1434CB"/>
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">VISA</text>
                </svg>
              </div>
              <div className="payment-icon-wrapper">
                <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="50" height="30" rx="4" fill="#EB001B"/>
                  <circle cx="20" cy="15" r="8" fill="#FF5F00" opacity="0.8"/>
                  <circle cx="30" cy="15" r="8" fill="#F79E1B" opacity="0.8"/>
                </svg>
              </div>
              <div className="payment-icon-wrapper">
                <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="50" height="30" rx="4" fill="#00897B"/>
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Mada</text>
                </svg>
              </div>
              <div className="payment-icon-wrapper">
                <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="50" height="30" rx="4" fill="#5E35B1"/>
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">STC</text>
                </svg>
              </div>
              <div className="payment-icon-wrapper">
                <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="50" height="30" rx="4" fill="#000000"/>
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">Apple Pay</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <p className="copyright">
              {t('footer.bottom.copyright', { year: currentYear })}
            </p>
            <div className="footer-bottom-links">
              <a href="/sitemap">{t('footer.bottom.sitemap')}</a>
              {!isMobile && <span className="separator">•</span>}
              <a href="/accessibility">{t('footer.bottom.accessibility')}</a>
              {!isMobile && <span className="separator">•</span>}
              <a href="/help">{t('footer.bottom.helpCenter')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;