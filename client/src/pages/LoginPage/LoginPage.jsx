import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import FormInput from '../../components/FormInput/FormInput';
import './LoginPage.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.errors.passwordShort');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Store user data in localStorage for demo
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', formData.email);
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      setIsLoading(false);
      setShowSuccess(true);
      
      // Redirect after success animation
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 2000);
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    // Simulate social login
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

  return (
    <>
      <Helmet>
        <title>{t('auth.login.pageTitle')} - GamersStation</title>
        <meta name="description" content={t('auth.login.pageDescription')} />
      </Helmet>
      
      <div className="login-page">
        <div className="login-background">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
          <div className="gradient-orb gradient-orb-3"></div>
        </div>
        
        <div className="login-container">
          <div className="login-card">
            {/* Logo and Title */}
            <div className="login-header">
              <div className="logo-container">
                <img src="/logo.svg" alt="GamersStation" className="logo-image" />
              </div>
              <h1 className="login-title">{t('auth.login.welcomeBack')}</h1>
              <p className="login-subtitle">{t('auth.login.enterCredentials')}</p>
            </div>

            {/* Success Animation */}
            {showSuccess && (
              <div className="success-overlay">
                <div className="success-animation">
                  <svg className="success-checkmark" viewBox="0 0 52 52">
                    <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                  <p className="success-text">{t('auth.login.successMessage')}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
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
                autoComplete="current-password"
                disabled={isLoading}
              />

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="checkbox-input"
                    disabled={isLoading}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">{t('auth.login.rememberMe')}</span>
                </label>
                
                <Link to="/forgot-password" className="forgot-password-link">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="button-loader"></span>
                ) : (
                  t('auth.login.signIn')
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span>{t('auth.login.orContinueWith')}</span>
            </div>

            {/* Social Login */}
            <div className="social-login">
              <button
                type="button"
                className="social-button google"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13999 18.63 6.70999 16.7 5.83999 14.1H2.17999V16.94C3.97999 20.53 7.69999 23 12 23Z" fill="#34A853"/>
                  <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.84 14.09Z" fill="#FBBC05"/>
                  <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.69999 1 3.97999 3.47 2.17999 7.07L5.83999 9.91C6.70999 7.31 9.13999 5.38 12 5.38Z" fill="#EA4335"/>
                </svg>
                <span>{t('auth.login.googleSignIn')}</span>
              </button>

              <button
                type="button"
                className="social-button facebook"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.40405 18.6269 0 12 0C5.37258 0 0 5.40405 0 12.073C0 18.0988 4.38823 23.0935 10.125 24V15.563H7.07812V12.073H10.125V9.41343C10.125 6.38755 11.9165 4.71615 14.6576 4.71615C15.9705 4.71615 17.3438 4.95195 17.3438 4.95195V7.92313H15.8306C14.3399 7.92313 13.875 8.85379 13.875 9.80857V12.073H17.2031L16.6711 15.563H13.875V24C19.6118 23.0935 24 18.0988 24 12.073Z" fill="#1877F2"/>
                </svg>
                <span>{t('auth.login.facebookSignIn')}</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="auth-footer">
              <p>
                {t('auth.login.noAccount')}{' '}
                <Link to="/register" className="auth-link">
                  {t('auth.login.signUp')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;