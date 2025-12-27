import React, { useState } from 'react';
import './FormInput.css';

const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  icon,
  autoComplete,
  disabled = false,
  onBlur,
  pattern,
  maxLength,
  minLength,
  success,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;
  const hasSuccess = !!success && !error;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`form-input-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''} ${hasSuccess ? 'success' : ''} ${disabled ? 'disabled' : ''}`}>
      {label && (
        <label className="form-input-label" htmlFor={name}>
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      
      <div className="form-input-wrapper">
        {icon && <span className="form-input-icon">{icon}</span>}
        
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="form-input-field"
          aria-invalid={!!error}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          pattern={pattern}
          maxLength={maxLength}
          minLength={minLength}
        />
        
        {isPasswordType && (
          <button
            type="button"
            className="password-toggle-btn"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3L21 21M10.584 10.587C10.2087 10.962 9.99778 11.4696 9.99778 12C9.99778 12.5303 10.2087 13.038 10.584 13.413C10.959 13.788 11.4667 13.999 11.997 13.999C12.5273 13.999 13.035 13.788 13.41 13.413M9.363 5.365C10.2204 5.11972 11.1082 4.99684 12 5C17 5 21.4 8.055 24 12C23.14 13.416 22.042 14.679 20.748 15.738M17.738 17.738C16.2317 18.5917 14.5487 19.0595 12.83 19.103C12.5542 19.1095 12.2776 19.1049 12.001 19.089C11.7243 19.1039 11.4477 19.1084 11.172 19.102C6.218 18.958 2.003 15.948 0 12C0.859 10.584 1.957 9.32 3.252 8.262" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div className="form-input-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
      {!error && success && (
        <div className="form-input-success" aria-live="polite">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;