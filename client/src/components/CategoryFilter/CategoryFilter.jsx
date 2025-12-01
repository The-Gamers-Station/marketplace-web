import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CategoryFilter.css';

const CategoryFilter = () => {
  const { t, i18n } = useTranslation();
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
  ];

  const filters = [
    { key: 'accessories', label: t('categoryFilter.accessories') },
    { key: 'categories', label: i18n.language === 'ar' ? 'الكونسولات' : 'Consoles' },
    { key: 'console', label: i18n.language === 'ar' ? 'كونسل' : 'Console' },
    { key: 'region', label: i18n.language === 'ar' ? 'اشرطة' : 'Games' },
    { key: 'subcategories', label: i18n.language === 'ar' ? 'الفئات الفرعية' : 'Subcategories' },
  ];

  return (
    <div className="category-filter">
      <div className="filter-container">
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
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;