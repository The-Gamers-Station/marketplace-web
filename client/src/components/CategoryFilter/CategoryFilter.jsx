import React, { useState } from 'react';
import './CategoryFilter.css';

const CategoryFilter = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('بلايستيشن');
  const [selectedFilters, setSelectedFilters] = useState({
    country: 'اكسسوارات',
    console: 'كونسل',
    region: 'اشرطة',
    categories: 'الكونسولات',
  });

  const platforms = [
    { name: 'بلايستيشن', active: true },
    { name: 'PC', active: false },
    { name: 'XBOX', active: false },
    { name: 'TV', active: false },
    { name: 'PC', active: false },
    { name: 'XBOX', active: false },
    { name: 'TV', active: false },
    { name: 'PC', active: false },
    { name: 'XBOX', active: false },
    { name: 'TV', active: false },
    { name: 'PC', active: false },
    { name: 'XBOX', active: false },
  ];

  const filters = [
    { key: 'country', label: 'اكسسوارات' },
    { key: 'categories', label: 'الكونسولات' },
    { key: 'console', label: 'كونسل' },
    { key: 'region', label: 'اشرطة' },
    { key: 'subcategories', label: 'الكونسولات' },
    { key: 'console2', label: 'كونسل' },
    { key: 'region2', label: 'اشرطة' },
    { key: 'categories2', label: 'الكونسولات' },
    { key: 'console3', label: 'كونسل' },
    { key: 'region3', label: 'اشرطة' },
    { key: 'categories3', label: 'الكونسولات' },
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
              onClick={() => setSelectedPlatform(platform.name)}
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
            <span className="results-text">أظهر حسب الحصل بطاقة</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;