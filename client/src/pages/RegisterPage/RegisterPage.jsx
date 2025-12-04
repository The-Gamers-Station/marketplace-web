import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import FormInput from '../../components/FormInput/FormInput';
import './RegisterPage.css';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('auth.errors.firstNameRequired');
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('auth.errors.firstNameShort');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.errors.lastNameRequired');
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t('auth.errors.lastNameShort');
    }
    
    if (!formData.phone) {
      newErrors.phone = t('auth.errors.phoneRequired');
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = t('auth.errors.phoneInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.errors.passwordShort');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('auth.errors.passwordWeak');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordMismatch');
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t('auth.errors.termsRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleSubmit(e);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Store user data in localStorage for demo
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
      
      setIsLoading(false);
      setShowSuccess(true);
      
      // Redirect after success animation
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }, 2000);
  };

  const handleSocialRegister = (provider) => {
    setIsLoading(true);
    // Simulate social registration
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authProvider', provider);
      setIsLoading(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 1500);
  };

  // Icon components
  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09501 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const EmailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    
    const labels = ['', t('auth.register.passwordWeak'), t('auth.register.passwordFair'), 
                    t('auth.register.passwordGood'), t('auth.register.passwordStrong'), 
                    t('auth.register.passwordVeryStrong')];
    
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      <Helmet>
        <title>{t('auth.register.pageTitle')} - GamersStation</title>
        <meta name="description" content={t('auth.register.pageDescription')} />
      </Helmet>
      
      <div className="register-page">
        <div className="register-background">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
          <div className="gradient-orb gradient-orb-3"></div>
          <div className="gradient-orb gradient-orb-4"></div>
        </div>
        
        <div className="register-container">
          <div className="register-card">
            {/* Header */}
            <div className="register-header">
              <div className="logo-container">
                <img src="/logo.svg" alt="GamersStation" className="logo-image" />
              </div>
              <h1 className="register-title">{t('auth.register.createAccount')}</h1>
              <p className="register-subtitle">{t('auth.register.joinCommunity')}</p>
            </div>

            {/* Progress Steps */}
            <div className="progress-steps">
              <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">{t('auth.register.personalInfo')}</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">{t('auth.register.accountDetails')}</span>
              </div>
            </div>

            {/* Success Animation */}
            {showSuccess && (
              <div className="success-overlay">
                <div className="success-animation">
                  <svg className="success-checkmark" viewBox="0 0 52 52">
                    <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                  <h2 className="success-title">{t('auth.register.successTitle')}</h2>
                  <p className="success-text">{t('auth.register.successMessage')}</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleNextStep} className="register-form">
              {currentStep === 1 ? (
                <>
                  {/* Step 1: Personal Information */}
                  <FormInput
                    label={t('auth.fields.firstName')}
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={t('auth.placeholders.firstName')}
                    error={errors.firstName}
                    required
                    icon={<UserIcon />}
                    autoComplete="given-name"
                    disabled={isLoading}
                  />

                  <FormInput
                    label={t('auth.fields.lastName')}
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={t('auth.placeholders.lastName')}
                    error={errors.lastName}
                    required
                    icon={<UserIcon />}
                    autoComplete="family-name"
                    disabled={isLoading}
                  />

                  <FormInput
                    label={t('auth.fields.phone')}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('auth.placeholders.phone')}
                    error={errors.phone}
                    required
                    icon={<PhoneIcon />}
                    autoComplete="tel"
                    disabled={isLoading}
                  />

                  <button
                    type="submit"
                    className="register-button primary"
                    disabled={isLoading}
                  >
                    {t('auth.register.nextStep')}
                  </button>
                </>
              ) : (
                <>
                  {/* Step 2: Account Details */}
                  <FormInput
                    label={t('auth.fields.email')}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('auth.placeholders.email')}
                    error={errors.email}
                    required
                    icon={<EmailIcon />}
                    autoComplete="email"
                    disabled={isLoading}
                  />

                  <FormInput
                    label={t('auth.fields.password')}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('auth.placeholders.password')}
                    error={errors.password}
                    required
                    icon={<LockIcon />}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />

                  {formData.password && (
                    <div className="password-strength">
                      <div className="password-strength-bar">
                        <div 
                          className={`password-strength-fill strength-${passwordStrength.strength}`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`password-strength-label strength-${passwordStrength.strength}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}

                  <FormInput
                    label={t('auth.fields.confirmPassword')}
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('auth.placeholders.confirmPassword')}
                    error={errors.confirmPassword}
                    required
                    icon={<LockIcon />}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />

                  <label className="terms-checkbox">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="checkbox-input"
                      disabled={isLoading}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-label">
                      {t('auth.register.agreeToTerms')}{' '}
                      <Link to="/terms" className="terms-link">
                        {t('auth.register.termsOfService')}
                      </Link>{' '}
                      {t('auth.register.and')}{' '}
                      <Link to="/privacy" className="terms-link">
                        {t('auth.register.privacyPolicy')}
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <span className="terms-error">{errors.agreeToTerms}</span>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="register-button secondary"
                      onClick={handlePrevStep}
                      disabled={isLoading}
                    >
                      {t('auth.register.prevStep')}
                    </button>
                    <button
                      type="submit"
                      className={`register-button primary ${isLoading ? 'loading' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="button-loader"></span>
                      ) : (
                        t('auth.register.createAccount')
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            {currentStep === 1 && (
              <>
                {/* Divider */}
                <div className="divider">
                  <span>{t('auth.register.orSignUpWith')}</span>
                </div>

                {/* Social Register */}
                <div className="social-register">
                  <button
                    type="button"
                    className="social-button google"
                    onClick={() => handleSocialRegister('google')}
                    disabled={isLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                      <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13999 18.63 6.70999 16.7 5.83999 14.1H2.17999V16.94C3.97999 20.53 7.69999 23 12 23Z" fill="#34A853"/>
                      <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.84 14.09Z" fill="#FBBC05"/>
                      <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.69999 1 3.97999 3.47 2.17999 7.07L5.83999 9.91C6.70999 7.31 9.13999 5.38 12 5.38Z" fill="#EA4335"/>
                    </svg>
                    <span>{t('auth.register.googleSignUp')}</span>
                  </button>

                  <button
                    type="button"
                    className="social-button facebook"
                    onClick={() => handleSocialRegister('facebook')}
                    disabled={isLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073C24 5.40405 18.6269 0 12 0C5.37258 0 0 5.40405 0 12.073C0 18.0988 4.38823 23.0935 10.125 24V15.563H7.07812V12.073H10.125V9.41343C10.125 6.38755 11.9165 4.71615 14.6576 4.71615C15.9705 4.71615 17.3438 4.95195 17.3438 4.95195V7.92313H15.8306C14.3399 7.92313 13.875 8.85379 13.875 9.80857V12.073H17.2031L16.6711 15.563H13.875V24C19.6118 23.0935 24 18.0988 24 12.073Z" fill="#1877F2"/>
                    </svg>
                    <span>{t('auth.register.facebookSignUp')}</span>
                  </button>
                </div>
              </>
            )}

            {/* Sign In Link */}
            <div className="auth-footer">
              <p>
                {t('auth.register.haveAccount')}{' '}
                <Link to="/login" className="auth-link">
                  {t('auth.register.signIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;