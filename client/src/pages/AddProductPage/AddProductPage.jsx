import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/Header/Header';
import FormInput from '../../components/FormInput/FormInput';
import Footer from '../../components/Footer/Footer';
import postService from '../../services/postService';
import cityService from '../../services/cityService';
import authService from '../../services/authService';
import { uploadFile } from '../../config/api';
import './AddProductPage.css';

const AddProductPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Check authentication
  const isAuthenticated = authService.isAuthenticated();
  
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    condition: 'NEW',
    type: '',
    cityId: '',
    images: []
  });
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Hardcoded platform categories structure
  const platformCategories = [
    {
      id: 'playstation',
      categoryId: 1,
      name: t('categoryFilter.playstation'),
      subcategories: [
        {
          id: 'devices',
          categoryId: 100,
          name: i18n.language === 'ar' ? 'الأجهزة' : 'Devices'
        },
        {
          id: 'games',
          categoryId: 101,
          name: i18n.language === 'ar' ? 'الألعاب' : 'Games'
        },
        {
          id: 'accessories',
          categoryId: 102,
          name: i18n.language === 'ar' ? 'الإكسسوارات' : 'Accessories'
        }
      ]
    },
    {
      id: 'xbox',
      categoryId: 2,
      name: t('categoryFilter.xbox'),
      subcategories: [
        {
          id: 'devices',
          categoryId: 200,
          name: i18n.language === 'ar' ? 'الأجهزة' : 'Devices'
        },
        {
          id: 'games',
          categoryId: 201,
          name: i18n.language === 'ar' ? 'الألعاب' : 'Games'
        },
        {
          id: 'accessories',
          categoryId: 202,
          name: i18n.language === 'ar' ? 'الإكسسوارات' : 'Accessories'
        }
      ]
    },
    {
      id: 'nintendo',
      categoryId: 3,
      name: t('categoryFilter.nintendo'),
      subcategories: [
        {
          id: 'devices',
          categoryId: 300,
          name: i18n.language === 'ar' ? 'الأجهزة' : 'Devices'
        },
        {
          id: 'games',
          categoryId: 301,
          name: i18n.language === 'ar' ? 'الألعاب' : 'Games'
        },
        {
          id: 'accessories',
          categoryId: 302,
          name: i18n.language === 'ar' ? 'الإكسسوارات' : 'Accessories'
        }
      ]
    },
    {
      id: 'pc',
      categoryId: 4,
      name: t('categoryFilter.pc') || 'PC',
      subcategories: [
        {
          id: 'devices',
          categoryId: 400,
          name: i18n.language === 'ar' ? 'الأجهزة' : 'Devices'
        },
        {
          id: 'games',
          categoryId: 401,
          name: i18n.language === 'ar' ? 'الألعاب' : 'Games'
        },
        {
          id: 'accessories',
          categoryId: 402,
          name: i18n.language === 'ar' ? 'الإكسسوارات' : 'Accessories'
        }
      ]
    }
  ];

  // Fetch cities on mount
  useEffect(() => {
    fetchCities();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);


  const fetchCities = async () => {
    try {
      const citiesData = await cityService.getCities();
      setCities(citiesData);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  // Convert Arabic numerals to English
  const convertArabicToEnglish = (str) => {
    const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
    const englishNumerals = '0123456789';
    
    let converted = str;
    for (let i = 0; i < arabicNumerals.length; i++) {
      const regex = new RegExp(arabicNumerals[i], 'g');
      converted = converted.replace(regex, englishNumerals[i]);
    }
    return converted;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for price field
    if (name === 'price') {
      // Convert Arabic numerals to English
      const convertedValue = convertArabicToEnglish(value);
      
      // Allow only numbers and decimal point
      const numericValue = convertedValue.replace(/[^\d.]/g, '');
      
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      const finalValue = parts.length > 2
        ? parts[0] + '.' + parts.slice(1).join('')
        : numericValue;
      
      setFormData(prev => ({
        ...prev,
        [name]: finalValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.type) {
      newErrors.type = t('addProduct.errors.typeRequired');
    }
    if (!selectedCategory) {
      newErrors.category = t('addProduct.errors.categoryRequired');
    }
    if (!selectedSubcategory) {
      newErrors.subcategory = t('addProduct.errors.subcategoryRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t('addProduct.errors.titleRequired');
    } else if (formData.title.trim().length < 5) {
      newErrors.title = t('addProduct.errors.titleTooShort') || 'Title must be at least 5 characters';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = t('addProduct.errors.priceRequired');
    }
    
    if (!formData.cityId) {
      newErrors.cityId = t('addProduct.errors.cityRequired');
    }

    // Require at least one image
    if (uploadedImages.length < 1) {
      newErrors.images = t('addProduct.errors.imagesRequired') || 'Please upload at least one image';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (!selectedCategoryId) {
        setErrors({ submit: t('addProduct.errors.categoryRequired') || 'Please select a valid category' });
        return;
      }
      
      const postData = {
        title: formData.title,
        description: 'Product for sale/wanted as described in the title', // Default description to satisfy API minimum 20 chars requirement
        type: formData.type,
        categoryId: selectedCategoryId,
        price: parseFloat(formData.price),
        cityId: parseInt(formData.cityId),
        condition: formData.condition,
        // Images are required by validation; submit current uploads
        imageUrls: uploadedImages
      };
      
      await postService.createPost(postData);
      
      // Show success popup
      setShowSuccessPopup(true);
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: error.message || t('addProduct.errors.submitFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Icon components
  const TitleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="5" x2="12" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const PriceIcon = () => (
    <img
      src="https://www.sama.gov.sa/ar-sa/Currency/SRS/PublishingImages/Saudi_Riyal_Symbol-1.png"
      alt="Saudi Riyal symbol"
      style={{
        objectFit: 'contain',
        filter: 'invert(1) brightness(2)',
        opacity: '0.7'
      }}
      referrerPolicy="no-referrer"
    />
  );

  const LocationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
  
    // Server constraints (mirror backend MediaService)
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const MAX_IMAGES = 10;
  
    // Enforce total images limit
    if (uploadedImages.length + files.length > MAX_IMAGES) {
      alert(t('addProduct.errors.tooManyImages') || `You can upload up to ${MAX_IMAGES} images.`);
      return;
    }
  
    // Validate types and sizes before uploading
    const valid = [];
    const rejected = [];
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        rejected.push({ name: f.name, reason: 'type' });
        continue;
      }
      if (f.size > MAX_SIZE_BYTES) {
        rejected.push({ name: f.name, reason: 'size' });
        continue;
      }
      valid.push(f);
    }
  
    if (rejected.length === files.length) {
      // All files invalid
      const reasons = rejected.map(r => `- ${r.name} (${r.reason === 'type' ? 'unsupported type' : 'too large'})`).join('\n');
      alert(
        (t('addProduct.errors.uploadInvalidFiles') || 'Some files are invalid. Allowed: JPG, JPEG, PNG, WEBP, GIF up to 10MB each.') +
        '\n' + reasons
      );
      return;
    } else if (rejected.length > 0) {
      // Partial invalid warning
      const reasons = rejected.map(r => `- ${r.name} (${r.reason === 'type' ? 'unsupported type' : 'too large'})`).join('\n');
      console.warn('Some files were rejected:\n' + reasons);
    }
  
    setUploadingImage(true);
    try {
      const uploadPromises = valid.map(file => uploadFile(file, 'posts'));
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results
        .filter(Boolean)
        .map(result => result.url)
        .filter(Boolean);
  
      if (newImageUrls.length === 0) {
        throw new Error('No images were uploaded');
      }
  
      setUploadedImages(prev => [...prev, ...newImageUrls]);
      // Clear images validation error on successful upload
      setErrors(prev => ({ ...prev, images: '' }));
    } catch (error) {
      console.error('Error uploading images:', error);
      // Don't show alert for upload failures - we'll use placeholder images
      console.warn('Image upload failed, will use placeholder images instead');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('addProduct.pageTitle')} - GamersStation</title>
        <meta name="description" content={t('addProduct.pageDescription')} />
      </Helmet>

      <div className="add-product-wizard">
        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="success-popup-overlay">
            <div className="success-popup">
              <div className="success-popup-icon">
                <svg className="success-checkmark" viewBox="0 0 52 52">
                  <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
              <h2 className="success-popup-title">{t('addProduct.successTitle')}</h2>
              <p className="success-popup-message">{t('addProduct.successMessage')}</p>
              <div className="success-popup-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <button
                className="success-popup-button"
                onClick={() => navigate('/')}
              >
                {t('common.showAllProducts') || 'Show All Products'}
              </button>
            </div>
          </div>
        )}

        <Header />
        
        <div className="product-create-backdrop">
          <div className="glow-sphere glow-sphere-1"></div>
          <div className="glow-sphere glow-sphere-2"></div>
          <div className="glow-sphere glow-sphere-3"></div>
        </div>

        <div className="product-wizard-container">
          {/* Progress Steps */}
          <div className="wizard-progress">
            <div className={`wizard-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-circle">1</div>
              <div className="step-text">{t('addProduct.steps.typeAndCategory')}</div>
            </div>
            <div className={`step-connector ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`wizard-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-circle">2</div>
              <div className="step-text">{t('addProduct.steps.detailsAndLocation')}</div>
            </div>
          </div>

          <div className="wizard-content">
            {/* Step 1: Type and Category Selection */}
            {step === 1 && (
              <div className="wizard-panel">
                {/* Type Selection */}
                <div className="type-selection-area">
                  <h2>{t('addProduct.selectType')}</h2>
                  <div className="type-buttons">
                    <button
                      className={`type-button ${formData.type === 'SELL' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'SELL' }))}
                    >
                      {t('addProduct.types.sale')}
                    </button>
                    <button
                      className={`type-button ${formData.type === 'ASK' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'ASK' }))}
                    >
                      {t('addProduct.types.wanted')}
                    </button>
                  </div>
                  {errors.type && (
                    <span className="field-error">{errors.type}</span>
                  )}
                </div>

                {/* Category Selection */}
                {formData.type && (
                  <div className="category-selection-area">
                    <h3>{t('addProduct.selectCategory')}</h3>
                    <div className="platform-grid">
                      {platformCategories.map(category => (
                        <button
                          key={category.id}
                          className={`platform-card no-icon ${selectedCategory === category.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setSelectedSubcategory('');
                            setSelectedCategoryId(null);
                          }}
                        >
                          <span className="platform-label">{category.name}</span>
                        </button>
                      ))}
                    </div>
                    {errors.category && (
                      <span className="field-error">{errors.category}</span>
                    )}

                    {/* Subcategory Selection */}
                    {selectedCategory && (
                      <div className="subcategory-area">
                        <h3>{t('addProduct.selectSubcategory')}</h3>
                        <div className="subcategory-list">
                          {platformCategories
                            .find(c => c.id === selectedCategory)
                            ?.subcategories.map(sub => (
                              <button
                                key={sub.id}
                                className={`subcategory-tag ${selectedSubcategory === sub.id ? 'selected' : ''}`}
                                onClick={() => {
                                  setSelectedSubcategory(sub.id);
                                  setSelectedCategoryId(sub.categoryId);
                                }}
                              >
                                {sub.name}
                              </button>
                            ))}
                        </div>
                        {errors.subcategory && (
                          <span className="field-error">{errors.subcategory}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Product Details, Location & Images */}
            {step === 2 && (
              <div className="wizard-panel">
                <h2>{t('addProduct.productDetails')}</h2>
                
                <form className="product-details-form">
                  <div className="input-group">
                    <label htmlFor="title">
                      {t('addProduct.fields.title')}
                      <span className="char-count" style={{ marginLeft: '10px', fontSize: '0.85em', color: formData.title.trim().length < 5 ? '#ff3838' : '#666' }}>
                        ({formData.title.trim().length}/5+)
                      </span>
                    </label>
                    <div className="input-container">
                      <TitleIcon />
                      <input
                        id="title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder={t('addProduct.placeholders.title')}
                        className={errors.title ? 'has-error' : ''}
                      />
                    </div>
                    {errors.title && (
                      <span className="field-error">{errors.title}</span>
                    )}
                  </div>

                  <div className="split-inputs">
                    <div className="input-group">
                      <label htmlFor="price">
                        {t('addProduct.fields.price')}   
                      </label>
                      <div className="input-container">
                        <input
                          id="price"
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder={t('addProduct.placeholders.price')}
                          className={errors.price ? 'has-error' : ''}
                          required
                        />
                        {/* <PriceIcon /> */}
                      </div>
                      {errors.price && (
                        <span className="field-error">{errors.price}</span>
                      )}
                    </div>

                    <div className="input-group">
                      <label htmlFor="condition">
                        {t('addProduct.fields.condition')}
                      </label>
                      <select
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        className="select-input"
                      >
                        <option value="NEW">{t('addProduct.conditions.new')}</option>
                        <option value="LIKE_NEW">{t('addProduct.conditions.likeNew')}</option>
                        <option value="USED_GOOD">{t('addProduct.conditions.good')}</option>
                        <option value="USED_FAIR">{t('addProduct.conditions.fair')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="cityId">
                      <LocationIcon />
                      {t('addProduct.fields.city')}
                    </label>
                    <select
                      id="cityId"
                      name="cityId"
                      value={formData.cityId}
                      onChange={handleChange}
                      className={`select-input ${errors.cityId ? 'has-error' : ''}`}
                      disabled={loadingCities}
                    >
                      <option value="">{t('addProduct.placeholders.selectCity')}</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>
                          {i18n.language === 'ar' ? city.nameAr : city.nameEn}
                        </option>
                      ))}
                    </select>
                    {errors.cityId && (
                      <span className="field-error">{errors.cityId}</span>
                    )}
                  </div>

                  <div className="media-upload-area">
                    <h3>{t('addProduct.fields.images')}</h3>
                    <p className="upload-hint">{t('addProduct.imageHint')}</p>
                    
                    <div className="upload-grid">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="uploaded-image-preview">
                          <img src={imageUrl} alt={t('imageAlt.productNumber', { number: index + 1 })} />
                          <button
                            className="remove-image-btn"
                            onClick={() => {
                              setUploadedImages(prev => {
                                const next = prev.filter((_, i) => i !== index);
                                if (next.length === 0) {
                                  setErrors(prevErr => ({
                                    ...prevErr,
                                    images: t('addProduct.errors.imagesRequired') || 'Please upload at least one image'
                                  }));
                                }
                                return next;
                              });
                            }}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      {uploadedImages.length < 10 && (
                        <label className={`upload-trigger ${uploadingImage ? 'uploading' : ''}`}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            style={{ display: 'none' }}
                          />
                          {uploadingImage ? (
                            <div className="upload-loading">
                              <span className="upload-spinner"></span>
                              <span>{t('addProduct.uploading')}</span>
                            </div>
                          ) : (
                            <>
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                                <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              <span>{t('addProduct.uploadImage')}</span>
                              <span className="upload-hint-small">{uploadedImages.length}/10</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                    {errors.images && (
                      <span className="field-error">{errors.images}</span>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Action Buttons */}
            <div className="wizard-actions">
              {step > 1 && (
                <button
                  className="action-secondary"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  {t('common.back')}
                </button>
              )}
              
              <button
                className={`action-primary ${isSubmitting ? 'processing' : ''}`}
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="action-loader"></span>
                    {t('addProduct.submitting')}
                  </>
                ) : (
                  step === 2 ? t('addProduct.submitProduct') : t('common.next')
                )}
              </button>
            </div>

            {errors.submit && (
              <div className="submit-error">
                {errors.submit}
              </div>
            )}
          </div>
        </div>

     
      </div>
    </>
  );
};

export default AddProductPage;