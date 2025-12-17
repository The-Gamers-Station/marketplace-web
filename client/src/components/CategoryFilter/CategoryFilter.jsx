import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './CategoryFilter.css';

const CategoryFilter = ({ onFilterChange }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  
  // Generic subcategories for "all" platform - these will search across all platforms
  const genericSubcategories = [
    {
      key: 'devices',
      name: i18n.language === 'ar' ? 'الأجهزة' : 'Devices',
      categoryIds: [100, 200, 300] // PlayStation, Xbox, Nintendo device IDs
    },
    {
      key: 'games',
      name: i18n.language === 'ar' ? 'الألعاب' : 'Games',
      categoryIds: [101, 201, 301] // PlayStation, Xbox, Nintendo game IDs
    },
    {
      key: 'accessories',
      name: i18n.language === 'ar' ? 'الإكسسوارات' : 'Accessories',
      categoryIds: [102, 202, 302] // PlayStation, Xbox, Nintendo accessories IDs
    }
  ];

  // Hardcoded platforms and subcategories
  const platforms = [
    {
      name: t('categoryFilter.all') || 'All',
      key: 'all',
      categoryId: null,
      subcategories: genericSubcategories
    },
    {
      name: t('categoryFilter.playstation') || 'PlayStation',
      key: 'playstation',
      categoryId: null, // Will use subcategory IDs instead
      categoryIds: [100, 101, 102], // All PlayStation category IDs
      subcategories: [
        { key: 'devices', name: i18n.language === 'ar' ? 'الأجهزة' : 'Devices', categoryId: 100 },
        { key: 'games', name: i18n.language === 'ar' ? 'الألعاب' : 'Games', categoryId: 101 },
        { key: 'accessories', name: i18n.language === 'ar' ? 'الإكسسوارات' : 'Accessories', categoryId: 102 }
      ]
    },
    {
      name: t('categoryFilter.xbox') || 'Xbox',
      key: 'xbox',
      categoryId: null, // Will use subcategory IDs instead
      categoryIds: [200, 201, 202], // All Xbox category IDs
      subcategories: [
        { key: 'devices', name: i18n.language === 'ar' ? 'الأجهزة' : 'Devices', categoryId: 200 },
        { key: 'games', name: i18n.language === 'ar' ? 'الألعاب' : 'Games', categoryId: 201 },
        { key: 'accessories', name: i18n.language === 'ar' ? 'الإكسسوارات' : 'Accessories', categoryId: 202 }
      ]
    },
    {
      name: t('categoryFilter.nintendo') || 'Nintendo',
      key: 'nintendo',
      categoryId: null, // Will use subcategory IDs instead
      categoryIds: [300, 301, 302], // All Nintendo category IDs
      subcategories: [
        { key: 'devices', name: i18n.language === 'ar' ? 'الأجهزة' : 'Devices', categoryId: 300 },
        { key: 'games', name: i18n.language === 'ar' ? 'الألعاب' : 'Games', categoryId: 301 },
        { key: 'accessories', name: i18n.language === 'ar' ? 'الإكسسوارات' : 'Accessories', categoryId: 302 }
      ]
    }
  ];

  // Get current platform's subcategories
  const currentPlatform = platforms.find(p => p.key === selectedPlatform);
  const subcategories = currentPlatform?.subcategories || [];


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
    setSelectedSubcategory('all');
    if (onFilterChange) {
      // If platform is 'all', pass null
      if (platform.key === 'all') {
        onFilterChange(null);
      } else if (platform.categoryIds) {
        // Pass multiple category IDs for platform-wide search
        onFilterChange(null, platform.categoryIds);
      } else {
        onFilterChange(platform.categoryId);
      }
    }
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory.key);
    if (onFilterChange) {
      if (subcategory.categoryIds) {
        // For generic subcategories (when platform is "all")
        onFilterChange(null, subcategory.categoryIds);
      } else {
        // For platform-specific subcategories
        onFilterChange(subcategory.categoryId);
      }
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

            {/* Subcategory Filter Tags */}
            <div className="filter-tags">
              {subcategories.length > 0 && (
                <>
                  <button
                    className={`filter-tag ${selectedSubcategory === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSubcategory('all');
                      if (onFilterChange) {
                        if (currentPlatform.categoryIds) {
                          // Pass multiple category IDs for platform-wide search
                          onFilterChange(null, currentPlatform.categoryIds);
                        } else {
                          onFilterChange(currentPlatform.categoryId);
                        }
                      }
                    }}
                  >
                    {i18n.language === 'ar' ? 'الكل' : 'All'}
                  </button>
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory.key}
                      className={`filter-tag ${selectedSubcategory === subcategory.key ? 'active' : ''}`}
                      onClick={() => handleSubcategoryChange(subcategory)}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </>
              )}

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