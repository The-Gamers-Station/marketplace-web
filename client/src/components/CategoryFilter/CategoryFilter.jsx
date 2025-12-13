import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import categoryService from '../../services/categoryService';
import './CategoryFilter.css';

const CategoryFilter = ({ onFilterChange }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [categories, setCategories] = useState([]);
  
  // Fetch categories from backend on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const platformCategories = await categoryService.getGamingPlatforms();
        setCategories(platformCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Build platforms array from fetched categories
  const platforms = [
    { name: t('categoryFilter.all') || 'All', key: 'all', categoryId: null },
    ...categories.map(cat => {
      // Map category slugs to translation keys
      const translationKeyMap = {
        'playstation': 'playstation',
        'xbox': 'xbox',
        'nintendo': 'nintendo',
        'pc-gaming': 'pc',
        'gaming-accessories': 'accessories'
      };
      
      const translationKey = translationKeyMap[cat.slug] || cat.slug;
      
      return {
        name: t(`categoryFilter.${translationKey}`) || cat.nameEn,
        key: cat.slug,
        categoryId: cat.id
      };
    })
  ];

  const filters = [
    { key: 'accessories', label: t('categoryFilter.accessories') },
    { key: 'categories', label: i18n.language === 'ar' ? 'الكونسولات' : 'Consoles' },
    { key: 'console', label: i18n.language === 'ar' ? 'كونسل' : 'Console' },
    { key: 'region', label: i18n.language === 'ar' ? 'اشرطة' : 'Games' },
    { key: 'subcategories', label: i18n.language === 'ar' ? 'الفئات الفرعية' : 'Subcategories' },
  ];

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  // Handle Add Product button click
  const handleAddProduct = () => {
    if (isAuthenticated) {
      navigate('/add-product');
    } else {
      navigate('/login');
    }
  };

  // Handle platform selection
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform.key);
    if (onFilterChange) {
      onFilterChange(platform.categoryId);
    }
  };

  return (
    <div className="category-filter">
      <div className="filter-container">
        {/* Grid Container for Categories and Add Product Button */}
        <div className="category-header-wrapper">
          <div className="">
            <div className="category-grid-wrapper">
              {/* Platform Pills */}
              <div className="platform-pills">
                {platforms.map((platform, index) => (
                  <button
                    key={index}
                    className={`platform-pill ${
                      selectedPlatform === platform.key ? "active" : ""
                    }`}
                    onClick={() => handlePlatformChange(platform)}
                  >
                    {platform.name}
                  </button>
                ))}
                <button className="nav-arrow">›</button>
              </div>
            </div>

            {/* Filter Tags */}
            <div className="filter-tags">
              {filters.map((filter) => (
                <button key={filter.key} className="filter-tag">
                  {filter.label}
                </button>
              ))}
              {/* <div className="view-toggle">
                <button className="view-btn active">⊞</button>
                <button className="view-btn">☰</button>
                <span className="results-text">
                  {i18n.language === "ar"
                    ? "أظهر حسب البطاقة"
                    : "Show as cards"}
                </span>
              </div> */}

              {/* Add Product Button */}
              <button
                className="category-add-product-btn"
                onClick={handleAddProduct}
              >
                <div className="btn-glow-effect"></div>
                <div className="btn-content">
                  <svg
                    className="btn-icon plus-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="12"
                      y1="5"
                      x2="12"
                      y2="19"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="5"
                      y1="12"
                      x2="19"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="btn-text">{t("addProduct.addProductButton")}</span>
                  <svg
                    className="btn-icon sparkles-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="btn-particles">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;