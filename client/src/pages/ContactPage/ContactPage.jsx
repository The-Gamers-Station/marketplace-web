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
import './ContactPage.css';

const ContactPage = () => {
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
      newErrors.name = 'الاسم مطلوب';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'الموضوع مطلوب';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'الرسالة مطلوبة';
    } else if (formData.message.length < 10) {
      newErrors.message = 'الرسالة يجب أن تكون 10 أحرف على الأقل';
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
    <div className="contact-page">
      <Header />
      
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <MessageSquare className="title-icon" />
              تواصل معنا
            </h1>
            <p className="hero-subtitle">
              نحن هنا لمساعدتك. تواصل معنا في أي وقت وسنرد عليك في أسرع وقت ممكن
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
                <h2>أرسل لنا رسالة</h2>
                <p>املأ النموذج أدناه وسنتواصل معك قريباً</p>
              </div>

              {submitSuccess && (
                <div className="success-message">
                  <CheckCircle size={20} />
                  <span>تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.</span>
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <User size={16} />
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="أدخل اسمك الكامل"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <Mail size={16} />
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
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
                      رقم الهاتف (اختياري)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">
                      <MessageCircle size={16} />
                      الموضوع
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? 'error' : ''}
                    >
                      <option value="">اختر الموضوع</option>
                      <option value="general">استفسار عام</option>
                      <option value="order">الطلبات</option>
                      <option value="technical">دعم فني</option>
                      <option value="complaint">شكوى</option>
                      <option value="suggestion">اقتراح</option>
                      <option value="partnership">شراكة</option>
                    </select>
                    {errors.subject && <span className="error-message">{errors.subject}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    <MessageSquare size={16} />
                    الرسالة
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="اكتب رسالتك هنا..."
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
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      إرسال الرسالة
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
                <h3>معلومات التواصل</h3>
                <div className="info-items">
                  <div className="info-item">
                    <div className="info-icon">
                      <Phone size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">اتصل بنا</span>
                      <a href="tel:+966501234567" dir="ltr">+966 50 123 4567</a>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <Mail size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">البريد الإلكتروني</span>
                      <a href="mailto:support@gamersstation.sa">support@gamersstation.sa</a>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">العنوان</span>
                      <span>الرياض، المملكة العربية السعودية</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <Clock size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">ساعات العمل</span>
                      <span>السبت - الخميس: 9 ص - 10 م</span>
                      <span>الجمعة: 2 م - 10 م</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="info-card">
                <h3>تابعنا على</h3>
                <div className="social-grid">
                  <a href="#" className="social-card facebook">
                    <Facebook size={24} />
                    <span>Facebook</span>
                  </a>
                  <a href="#" className="social-card twitter">
                    <Twitter size={24} />
                    <span>Twitter</span>
                  </a>
                  <a href="#" className="social-card instagram">
                    <Instagram size={24} />
                    <span>Instagram</span>
                  </a>
                  <a href="#" className="social-card youtube">
                    <Youtube size={24} />
                    <span>Youtube</span>
                  </a>
                </div>
              </div>

              {/* Support Options */}
              <div className="info-card">
                <h3>طرق أخرى للتواصل</h3>
                <div className="support-options">
                  <a href="#" className="support-option">
                    <Headphones size={20} />
                    <div>
                      <strong>الدعم المباشر</strong>
                      <span>دردشة مباشرة مع فريق الدعم</span>
                    </div>
                    <ArrowLeft size={16} />
                  </a>
                  <a href="/faq" className="support-option">
                    <MessageCircle size={20} />
                    <div>
                      <strong>الأسئلة الشائعة</strong>
                      <span>إجابات سريعة لأسئلتك</span>
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
              <div className="map-overlay">
                <div className="location-marker">
                  <MapPin size={30} />
                  <span>موقعنا الرئيسي</span>
                </div>
              </div>
              {/* Placeholder for actual map */}
              <div className="map-placeholder">
                <p>الخريطة التفاعلية</p>
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