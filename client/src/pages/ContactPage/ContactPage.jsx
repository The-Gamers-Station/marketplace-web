import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CheckCircle,
  User,
  MessageCircle,
  Headphones,
  ArrowLeft
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useTranslation } from 'react-i18next';
import './ContactPage.css';

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('auth.errors.firstNameRequired');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = i18n.language === 'ar' ? 'الموضوع مطلوب' : 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = i18n.language === 'ar' ? 'الرسالة مطلوبة' : 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = i18n.language === 'ar' ? 'الرسالة يجب أن تكون 10 أحرف على الأقل' : 'Message must be at least 10 characters';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 2000);
  };

  return (
    <div className="contact-page no-header-animation">
      <Header />
      
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="contact-content">
            <h1 className="contact-title">
              <MessageSquare className="title-icon" />
              {t('pages.contact.title')}
            </h1>
            <p className="contact-subtitle">
              {i18n.language === 'ar' ? 'نحن هنا لمساعدتك. تواصل معنا في أي وقت وسنرد عليك في أسرع وقت ممكن' : 'We are here to help you. Contact us anytime and we will get back to you as soon as possible'}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <div className="form-header">
                <h2>{i18n.language === 'ar' ? 'أرسل لنا رسالة' : 'Send us a message'}</h2>
                <p>{i18n.language === 'ar' ? 'املأ النموذج أدناه وسنتواصل معك قريباً' : 'Fill out the form below and we will contact you soon'}</p>
              </div>

              {submitSuccess && (
                <div className="success-message">
                  <CheckCircle size={20} />
                  <span>{t('pages.contact.submitSuccessMessage')}</span>
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <User size={16} />
                      {t('pages.contact.fullName')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('pages.contact.fullNamePlaceholder')}
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <Mail size={16} />
                      {t('pages.contact.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('pages.contact.emailPlaceholder')}
                      className={errors.email ? 'error' : ''}
                      dir="ltr"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">
                      <Phone size={16} />
                      {t('pages.contact.phone')} ({i18n.language === 'ar' ? 'اختياري' : 'Optional'})
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('pages.contact.phonePlaceholder')}
                      dir="ltr"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">
                      <MessageCircle size={16} />
                      {t('pages.contact.subject')}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? 'error' : ''}
                    >
                      <option value="">{t('pages.contact.selectSubject')}</option>
                      <option value="general">{t('pages.contact.subjects.general')}</option>
                      <option value="order">{t('pages.contact.subjects.order')}</option>
                      <option value="technical">{t('pages.contact.subjects.technical')}</option>
                      <option value="complaint">{t('pages.contact.subjects.complaint')}</option>
                      <option value="suggestion">{t('pages.contact.subjects.suggestion')}</option>
                      <option value="partnership">{t('pages.contact.subjects.partnership')}</option>
                    </select>
                    {errors.subject && <span className="error-message">{errors.subject}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    <MessageSquare size={16} />
                    {t('pages.contact.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('pages.contact.messagePlaceholder')}
                    rows="6"
                    className={errors.message ? 'error' : ''}
                  />
                  {errors.message && <span className="error-message">{errors.message}</span>}
                  <span className="char-count">{formData.message.length} / 500</span>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      {t('pages.contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t('pages.contact.send')}
                      <ArrowLeft size={18} className="arrow-icon" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info-wrapper">
              {/* Quick Contact */}
              <div className="info-card">
                <h3>{i18n.language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}</h3>
                <div className="info-items">
                  <div className="info-item">
                    <div className="info-icon">
                      <Mail size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">{t('pages.contact.email')}</span>
                      <a href="mailto:contact@thegamersstation.com">contact@thegamersstation.com</a>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">{t('pages.contact.address')}</span>
                      <span>{t('pages.contact.address')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="info-card">
                <h3>{t('pages.contact.followUs')}</h3>
                <div className="social-grid">
                  <a href="https://www.facebook.com/GamersStationApp" className="social-card facebook" target="_blank" rel="noopener noreferrer">
                    <Facebook size={24} />
                    <span>Facebook</span>
                  </a>
                  <a href="https://www.twitter.com/GamersStationApp" className="social-card twitter" target="_blank" rel="noopener noreferrer">
                    <Twitter size={24} />
                    <span>Twitter</span>
                  </a>
                  <a href="https://www.instagram.com/GamersStationApp" className="social-card instagram" target="_blank" rel="noopener noreferrer">
                    <Instagram size={24} />
                    <span>Instagram</span>
                  </a>
                  <a href="https://www.youtube.com/@GamersStationApp" className="social-card youtube" target="_blank" rel="noopener noreferrer">
                    <Youtube size={24} />
                    <span>Youtube</span>
                  </a>
                </div>
              </div>

              {/* Support Options */}
              <div className="info-card">
                <h3>{i18n.language === 'ar' ? 'طرق أخرى للتواصل' : 'Other ways to contact'}</h3>
                <div className="support-options">
                  <a href="#" className="support-option">
                    <Headphones size={20} />
                    <div>
                      <strong>{i18n.language === 'ar' ? 'الدعم المباشر' : 'Live Support'}</strong>
                      <span>{i18n.language === 'ar' ? 'دردشة مباشرة مع فريق الدعم' : 'Live chat with support team'}</span>
                    </div>
                    <ArrowLeft size={16} />
                  </a>
                  <a href="/faq" className="support-option">
                    <MessageCircle size={20} />
                    <div>
                      <strong>{t('header.faq')}</strong>
                      <span>{i18n.language === 'ar' ? 'إجابات سريعة لأسئلتك' : 'Quick answers to your questions'}</span>
                    </div>
                    <ArrowLeft size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d464877.96579584634!2d46.42519562089844!3d24.68773040000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2ssa!4v1702300000000!5m2!1sen!2ssa"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="GamersStation Location - Riyadh"
              />
              <div className="map-overlay">
                <div className="location-marker">
                  <MapPin size={30} />
                  <span>{t('pages.contact.address')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;