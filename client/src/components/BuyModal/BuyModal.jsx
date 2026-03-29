import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShoppingBag, Shield, Truck, CheckCircle } from 'lucide-react';
import orderService from '../../services/orderService';
import userService from '../../services/userService';
import configService from '../../services/configService';
import { showError } from '../ErrorNotification/ErrorNotification';
import './BuyModal.css';

const BuyModal = ({ isOpen, onClose, product }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [step, setStep] = useState(1); // 1 = summary, 2 = shipping info
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [formData, setFormData] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingCity: '',
    shippingDistrict: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [pricingConfig, setPricingConfig] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(false);

  // Fetch pricing configuration when modal opens
  useEffect(() => {
    const loadPricing = async () => {
      if (isOpen && product?.price) {
        try {
          setLoadingPricing(true);
          const pricing = await configService.calculateTotal(product.price);
          setPricingConfig(pricing);
        } catch (error) {
          console.error('Error loading pricing:', error);
          // Fallback to default values if API fails
          setPricingConfig(null);
        } finally {
          setLoadingPricing(false);
        }
      }
    };
    
    loadPricing();
  }, [isOpen, product?.price]);

  // Preload user data when modal opens
  useEffect(() => {
    const loadUserData = async () => {
      if (isOpen && !formData.shippingName) {
        try {
          setLoadingUserData(true);
          const userData = await userService.getCurrentUserProfile();
          
          // Extract phone number without country code
          let phoneNumber = userData.phoneNumber || '';
          if (phoneNumber.startsWith('+966')) {
            phoneNumber = '0' + phoneNumber.substring(4);
          } else if (phoneNumber.startsWith('966')) {
            phoneNumber = '0' + phoneNumber.substring(3);
          }
          
          // Get city name based on language
          const cityName = userData.city 
            ? (currentLang === 'ar' ? userData.city.nameAr : userData.city.nameEn)
            : '';
          
          setFormData(prev => ({
            ...prev,
            shippingName: userData.username || userData.name || '',
            shippingPhone: phoneNumber,
            shippingCity: cityName,
            // shippingDistrict remains empty - user must provide
          }));
        } catch (error) {
          console.error('Error loading user data:', error);
          // Don't show error to user - they can still fill the form manually
        } finally {
          setLoadingUserData(false);
        }
      }
    };
    
    loadUserData();
  }, [isOpen, currentLang]);

  // Calculate pricing - use API values if available, otherwise fallback to defaults
  const productPrice = pricingConfig?.productPrice || product?.price || 0;
  const shippingFee = pricingConfig?.shippingFee || 30.0;
  const serviceFeePercent = pricingConfig?.serviceFeePercent || 4.0;
  const serviceFee = pricingConfig?.serviceFee || (productPrice * serviceFeePercent) / 100;
  const total = pricingConfig?.totalAmount || (productPrice + shippingFee + serviceFee);

  const handleInputChange = (e) => {
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
    
    if (!formData.shippingName.trim()) {
      newErrors.shippingName = t('orders.nameRequired');
    }
    
    if (!formData.shippingPhone.trim()) {
      newErrors.shippingPhone = t('orders.phoneRequired');
    } else if (!/^05\d{8}$/.test(formData.shippingPhone)) {
      newErrors.shippingPhone = t('orders.phoneInvalid');
    }
    
    if (!formData.shippingCity.trim()) {
      newErrors.shippingCity = t('orders.cityRequired');
    }
    
    if (!formData.shippingDistrict.trim()) {
      newErrors.shippingDistrict = t('orders.districtRequired');
    }
    
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = t('orders.termsRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await orderService.createOrder({
        postId: product.id,
        shippingName: formData.shippingName,
        shippingPhone: formData.shippingPhone,
        shippingCity: formData.shippingCity,
        shippingDistrict: formData.shippingDistrict,
      });
      
      setSuccess(true);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setStep(1);
        setFormData({
          shippingName: '',
          shippingPhone: '',
          shippingCity: '',
          shippingDistrict: '',
          termsAccepted: false,
        });
      }, 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setStep(1);
      setSuccess(false);
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="buy-modal-overlay" onClick={handleClose}>
      <div className="buy-modal" onClick={(e) => e.stopPropagation()}>
        {!success ? (
          <>
            <div className="buy-modal-header">
              <div className="buy-modal-header-content">
                <ShoppingBag className="buy-modal-icon" />
                <div>
                  <h2>{t('orders.buyWithTrust')}</h2>
                  <p className="buy-modal-subtitle">{product?.name || product?.title}</p>
                </div>
              </div>
              <button className="buy-modal-close" onClick={handleClose} disabled={loading}>
                <X />
              </button>
            </div>

            <div className="buy-modal-body">
              {step === 1 ? (
                <div className="buy-modal-step">
                  <h3 className="buy-modal-section-title">{t('orders.orderSummary')}</h3>
                  
                  <div className="buy-modal-pricing">
                    <div className="buy-modal-pricing-row">
                      <span>{t('orders.productPrice')}</span>
                      <span className="buy-modal-price">{productPrice.toFixed(2)} {t('currency')}</span>
                    </div>
                    <div className="buy-modal-pricing-row">
                      <span>{t('orders.shippingFee')}</span>
                      <span className="buy-modal-price">{shippingFee.toFixed(2)} {t('currency')}</span>
                    </div>
                    <div className="buy-modal-pricing-row">
                      <span>{t('orders.serviceFee')} ({serviceFeePercent}%)</span>
                      <span className="buy-modal-price">{serviceFee.toFixed(2)} {t('currency')}</span>
                    </div>
                    <div className="buy-modal-pricing-divider"></div>
                    <div className="buy-modal-pricing-row buy-modal-pricing-total">
                      <span>{t('orders.total')}</span>
                      <span className="buy-modal-price-total">{total.toFixed(2)} {t('currency')}</span>
                    </div>
                  </div>

                  <div className="buy-modal-features">
                    <div className="buy-modal-feature">
                      <Shield className="buy-modal-feature-icon" />
                      <span>{t('orders.secureTransaction')}</span>
                    </div>
                    <div className="buy-modal-feature">
                      <Truck className="buy-modal-feature-icon" />
                      <span>{t('pages.productDetails.fastDelivery')}</span>
                    </div>
                  </div>

                  <button 
                    className="buy-modal-button buy-modal-button-primary"
                    onClick={() => setStep(2)}
                  >
                    {t('common.next')}
                  </button>
                </div>
              ) : (
                <div className="buy-modal-step">
                  <h3 className="buy-modal-section-title">{t('orders.shippingInfo')}</h3>
                  
                  <div className="buy-modal-form">
                    <div className="buy-modal-form-group">
                      <label htmlFor="shippingName">{t('orders.shippingName')}</label>
                      <input
                        type="text"
                        id="shippingName"
                        name="shippingName"
                        value={formData.shippingName}
                        onChange={handleInputChange}
                        className={errors.shippingName ? 'error' : ''}
                        placeholder={t('orders.shippingName')}
                      />
                      {errors.shippingName && (
                        <span className="buy-modal-error">{errors.shippingName}</span>
                      )}
                    </div>

                    <div className="buy-modal-form-group">
                      <label htmlFor="shippingPhone">{t('orders.shippingPhone')}</label>
                      <input
                        type="tel"
                        id="shippingPhone"
                        name="shippingPhone"
                        value={formData.shippingPhone}
                        onChange={handleInputChange}
                        className={errors.shippingPhone ? 'error' : ''}
                        placeholder="05XXXXXXXX"
                      />
                      {errors.shippingPhone && (
                        <span className="buy-modal-error">{errors.shippingPhone}</span>
                      )}
                    </div>

                    <div className="buy-modal-form-row">
                      <div className="buy-modal-form-group">
                        <label htmlFor="shippingCity">{t('orders.shippingCity')}</label>
                        <input
                          type="text"
                          id="shippingCity"
                          name="shippingCity"
                          value={formData.shippingCity}
                          onChange={handleInputChange}
                          className={errors.shippingCity ? 'error' : ''}
                          placeholder={t('orders.shippingCity')}
                        />
                        {errors.shippingCity && (
                          <span className="buy-modal-error">{errors.shippingCity}</span>
                        )}
                      </div>

                      <div className="buy-modal-form-group">
                        <label htmlFor="shippingDistrict">{t('orders.shippingDistrict')}</label>
                        <input
                          type="text"
                          id="shippingDistrict"
                          name="shippingDistrict"
                          value={formData.shippingDistrict}
                          onChange={handleInputChange}
                          className={errors.shippingDistrict ? 'error' : ''}
                          placeholder={t('orders.shippingDistrict')}
                        />
                        {errors.shippingDistrict && (
                          <span className="buy-modal-error">{errors.shippingDistrict}</span>
                        )}
                      </div>
                    </div>

                    <div className="buy-modal-form-group buy-modal-checkbox-group">
                      <label className="buy-modal-checkbox-label">
                        <input
                          type="checkbox"
                          name="termsAccepted"
                          checked={formData.termsAccepted}
                          onChange={handleInputChange}
                        />
                        <span>{t('orders.acceptTerms')}</span>
                      </label>
                      {errors.termsAccepted && (
                        <span className="buy-modal-error">{errors.termsAccepted}</span>
                      )}
                    </div>
                  </div>

                  <div className="buy-modal-actions">
                    <button 
                      className="buy-modal-button buy-modal-button-secondary"
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      {t('common.back')}
                    </button>
                    <button 
                      className="buy-modal-button buy-modal-button-primary"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? t('common.loading') : t('orders.confirmOrder')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="buy-modal-success">
            <div className="buy-modal-success-icon">
              <CheckCircle />
            </div>
            <h2>{t('orders.requestSent')}</h2>
            <p>{t('orders.requestSentMessage')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyModal;
