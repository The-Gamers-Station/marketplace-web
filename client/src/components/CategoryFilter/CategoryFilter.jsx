import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './CategoryFilter.css';

const CategoryFilter = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('PlayStation');
  const [selectedFilters, setSelectedFilters] = useState({
    country: 'accessories',
    console: 'console',
    region: 'games',
    categories: 'consoles',
  });

  const platforms = [
    { name: t('categoryFilter.playstation'), key: 'playstation', active: true },
    { name: t('categoryFilter.pc'), key: 'pc', active: false },
    { name: t('categoryFilter.xbox'), key: 'xbox', active: false },
    { name: t('categoryFilter.nintendo'), key: 'nintendo', active: false },
    { name: t('categoryFilter.accessories'), key: 'accessories', active: false },
    { name: t('categoryFilter.playstation'), key: 'playstation', active: true },
    { name: t('categoryFilter.pc'), key: 'pc', active: false },
    { name: t('categoryFilter.xbox'), key: 'xbox', active: false },
    { name: t('categoryFilter.nintendo'), key: 'nintendo', active: false },
    { name: t('categoryFilter.accessories'), key: 'accessories', active: false },
  ];

  const filters = [
    { key: 'accessories', label: t('categoryFilter.accessories') },
    { key: 'categories', label: i18n.language === 'ar' ? 'الكونسولات' : 'Consoles' },
    { key: 'console', label: i18n.language === 'ar' ? 'كونسل' : 'Console' },
    { key: 'region', label: i18n.language === 'ar' ? 'اشرطة' : 'Games' },
    { key: 'subcategories', label: i18n.language === 'ar' ? 'الفئات الفرعية' : 'Subcategories' },
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
               className={`platform-pill ${platform.active ? 'active' : ''}`}
               onClick={() => setSelectedPlatform(platform.key)}
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
           <button
             key={filter.key}
             className="filter-tag"
           >
             {filter.label}
           </button>
         ))}
         <div className="view-toggle">
           <button className="view-btn active">⊞</button>
           <button className="view-btn">☰</button>
           <span className="results-text">
             {i18n.language === 'ar' ? 'أظهر حسب البطاقة' : 'Show as cards'}
           </span>
         </div>
            
            {/* Add Product Button */}
            <button
              className="category-add-product-btn"
              onClick={handleAddProduct}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{t('addProduct.addProductButton')}</span>
            </button>
          </div>
      </div>
       </div>
      </div>
    </div>
  );
};

export default CategoryFilter;