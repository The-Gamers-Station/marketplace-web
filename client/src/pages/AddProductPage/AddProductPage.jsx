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
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Check authentication
  const isAuthenticated = authService.isAuthenticated();
  
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('playstation');
  const [selectedSubcategory, setSelectedSubcategory] = useState('console');
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'NEW',
    type: 'SELL',
    cityId: '',
    images: []
  });
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Categories configuration
  const categories = [
    {
      id: 'playstation',
      name: t('categoryFilter.playstation'),
      icon: '🎮',
      subcategories: [
        { id: 'console', name: t('categoryFilter.console') },
        { id: 'games', name: t('categoryFilter.games') },
        { id: 'accessories', name: t('categoryFilter.accessories') }
      ]
    },
    {
      id: 'xbox',
      name: t('categoryFilter.xbox'),
      icon: '🎯',
      subcategories: [
        { id: 'console', name: t('categoryFilter.console') },
        { id: 'games', name: t('categoryFilter.games') },
        { id: 'accessories', name: t('categoryFilter.accessories') }
      ]
    },
    {
      id: 'nintendo',
      name: t('categoryFilter.nintendo'),
      icon: '🎨',
      subcategories: [
        { id: 'console', name: t('categoryFilter.console') },
        { id: 'games', name: t('categoryFilter.games') },
        { id: 'accessories', name: t('categoryFilter.accessories') }
      ]
    },
    {
      id: 'pc',
      name: t('categoryFilter.pc'),
      icon: '💻',
      subcategories: [
        { id: 'games', name: t('categoryFilter.games') },
        { id: 'accessories', name: t('categoryFilter.accessories') },
        { id: 'components', name: t('addProduct.categories.components') }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    return selectedCategory && selectedSubcategory;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t('addProduct.errors.titleRequired');
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t('addProduct.errors.descriptionRequired');
    } else if (formData.description.trim().length < 20) {
      newErrors.description = t('addProduct.errors.descriptionTooShort') || 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 5000) {
      newErrors.description = t('addProduct.errors.descriptionTooLong') || 'Description must not exceed 5000 characters';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = t('addProduct.errors.priceRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.cityId) {
      newErrors.cityId = t('addProduct.errors.cityRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
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
      const postData = {
        ...formData,
        categoryId: 1, // TODO: Map from selectedCategory + selectedSubcategory
        price: parseFloat(formData.price),
        cityId: parseInt(formData.cityId),
        // Use uploaded images or placeholder
        imageUrls: uploadedImages.length > 0 ? uploadedImages : ['https://via.placeholder.com/800x600?text=Product+Image']
      };
      
      await postService.createPost(postData);
      
      // Show success message
      alert(t('addProduct.successMessage'));
      
      // Redirect to home or my products
      navigate('/');
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

  const DescriptionIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const PriceIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
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
        <Header />
        
        <div className="product-create-backdrop">
          <div className="glow-sphere glow-sphere-1"></div>
          <div className="glow-sphere glow-sphere-2"></div>
          <div className="glow-sphere glow-sphere-3"></div>
        </div>

        <div className="product-wizard-container">
          <div className="wizard-heading">
            <h1>{t('addProduct.title')}</h1>
            <p>{t('addProduct.subtitle')}</p>
          </div>

          {/* Progress Steps */}
          <div className="wizard-progress">
            <div className={`wizard-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-circle">1</div>
              <div className="step-text">{t('addProduct.steps.category')}</div>
            </div>
            <div className={`step-connector ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`wizard-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-circle">2</div>
              <div className="step-text">{t('addProduct.steps.details')}</div>
            </div>
            <div className={`step-connector ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`wizard-step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <div className="step-text">{t('addProduct.steps.location')}</div>
            </div>
          </div>

          <div className="wizard-content">
            {/* Step 1: Category Selection */}
            {step === 1 && (
              <div className="wizard-panel">
                <h2>{t('addProduct.selectCategory')}</h2>
                
                <div className="platform-grid">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`platform-card ${selectedCategory === category.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedSubcategory(category.subcategories[0].id);
                      }}
                    >
                      <span className="platform-emoji">{category.icon}</span>
                      <span className="platform-label">{category.name}</span>
                    </button>
                  ))}
                </div>

                <div className="subcategory-area">
                  <h3>{t('addProduct.selectSubcategory')}</h3>
                  <div className="subcategory-list">
                    {categories
                      .find(c => c.id === selectedCategory)
                      ?.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          className={`subcategory-tag ${selectedSubcategory === sub.id ? 'selected' : ''}`}
                          onClick={() => setSelectedSubcategory(sub.id)}
                        >
                          {sub.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Product Details */}
            {step === 2 && (
              <div className="wizard-panel">
                <h2>{t('addProduct.productDetails')}</h2>
                
                <form className="product-details-form">
                  <FormInput
                    label={t('addProduct.fields.title')}
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={t('addProduct.placeholders.title')}
                    error={errors.title}
                    required
                    icon={<TitleIcon />}
                  />

                  <div className="input-group">
                    <label htmlFor="description">
                      {t('addProduct.fields.description')}
                      <span className="char-count" style={{ marginLeft: '10px', fontSize: '0.85em', color: formData.description.trim().length < 20 || formData.description.trim().length > 5000 ? '#ff3838' : '#666' }}>
                        ({formData.description.trim().length}/20-5000)
                      </span>
                    </label>
                    <div className="textarea-container">
                      <DescriptionIcon />
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder={t('addProduct.placeholders.description')}
                        className={errors.description ? 'has-error' : ''}
                        rows="5"
                      />
                    </div>
                    {errors.description && (
                      <span className="field-error">{errors.description}</span>
                    )}
                  </div>

                  <div className="split-inputs">
                    <FormInput
                      label={t('addProduct.fields.price')}
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder={t('addProduct.placeholders.price')}
                      error={errors.price}
                      required
                      icon={<PriceIcon />}
                      min="0"
                      step="0.01"
                    />

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
                    <label htmlFor="type">{t('addProduct.fields.type')}</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="select-input"
                    >
                      <option value="SELL">{t('addProduct.types.sale')}</option>
                      <option value="ASK">{t('addProduct.types.wanted')}</option>
                    </select>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Location & Images */}
            {step === 3 && (
              <div className="wizard-panel">
                <h2>{t('addProduct.locationImages')}</h2>
                
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
                        {city.nameEn || city.nameAr || city.name}
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
                        <img src={imageUrl} alt={`Product ${index + 1}`} />
                        <button
                          className="remove-image-btn"
                          onClick={() => {
                            setUploadedImages(prev => prev.filter((_, i) => i !== index));
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
                </div>
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
                  step === 3 ? t('addProduct.submitProduct') : t('common.next')
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

        <Footer />
      </div>
    </>
  );
};

export default AddProductPage;