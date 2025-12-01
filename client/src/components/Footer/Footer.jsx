import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
              <div className="footer-logo">
                <img src="/logo.svg" alt="GamersStation" className="footer-logo-icon" />
                <span className="footer-logo-text">GamersStation</span>
              </div>
              <p className="footer-description">
                {t('footer.about.description')}
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="#" className="social-link" aria-label="Youtube">
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
                <li><Link to="/">{t('footer.quickLinks.home')}</Link></li>
                <li><Link to="/merchants">{t('footer.quickLinks.merchants')}</Link></li>
                <li><Link to="/categories">{t('footer.quickLinks.categories')}</Link></li>
                <li><Link to="/offers">{t('footer.quickLinks.offers')}</Link></li>
                <li><Link to="/new-arrivals">{t('footer.quickLinks.newArrivals')}</Link></li>
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
                <li><Link to="/faq">{t('footer.customerService.faq')}</Link></li>
                <li><Link to="/contact">{t('footer.customerService.contact')}</Link></li>
                <li><Link to="/shipping">{t('footer.customerService.shipping')}</Link></li>
                <li><Link to="/returns">{t('footer.customerService.returns')}</Link></li>
                <li><Link to="/warranty">{t('footer.customerService.warranty')}</Link></li>
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
                <li><Link to="/terms">{t('footer.legal.terms')}</Link></li>
                <li><Link to="/privacy">{t('footer.legal.privacy')}</Link></li>
                <li><Link to="/cookies">{t('footer.legal.cookies')}</Link></li>
                <li><Link to="/about">{t('footer.legal.about')}</Link></li>
              </ul>
            </div>

            {/* Newsletter & Contact */}
            <div className="footer-section footer-contact">
              <h3 className="footer-title">{t('footer.contact.title')}</h3>
              <div className="contact-items">
                <div className="contact-item">
                  <Phone size={16} />
                  <span dir="ltr">+966 50 123 4567</span>
                </div>
                <div className="contact-item">
                  <Mail size={16} />
                  <span>support@gamersstation.sa</span>
                </div>
                <div className="contact-item">
                  <MapPin size={16} />
                  <span>{t('footer.contact.location')}</span>
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
              <img src="https://via.placeholder.com/50x30/1a2332/ffffff?text=Visa" alt="Visa" className="payment-icon" />
              <img src="https://via.placeholder.com/50x30/1a2332/ffffff?text=Master" alt="Mastercard" className="payment-icon" />
              <img src="https://via.placeholder.com/50x30/1a2332/ffffff?text=Mada" alt="Mada" className="payment-icon" />
              <img src="https://via.placeholder.com/50x30/1a2332/ffffff?text=STC" alt="STC Pay" className="payment-icon" />
              <img src="https://via.placeholder.com/50x30/1a2332/ffffff?text=Apple" alt="Apple Pay" className="payment-icon" />
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
              <Link to="/sitemap">{t('footer.bottom.sitemap')}</Link>
              {!isMobile && <span className="separator">•</span>}
              <Link to="/accessibility">{t('footer.bottom.accessibility')}</Link>
              {!isMobile && <span className="separator">•</span>}
              <Link to="/help">{t('footer.bottom.helpCenter')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;