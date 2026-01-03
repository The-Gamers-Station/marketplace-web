import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Gamepad2,
  Monitor,
  Headphones,
  LayoutGrid,
  Sparkles,
  Smartphone,
  Glasses,
  Disc3
} from 'lucide-react';
import './CategoryFilter.css';

const CategoryFilter = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  
  // Icons for subcategories
  const subcategoryIcons = {
    devices: <Monitor size={16} />,
    games: <Gamepad2 size={16} />,
    accessories: <Headphones size={16} />,
    controllers: <Gamepad2 size={16} />,
    storage: <Disc3 size={16} />,
    collectibles: <Sparkles size={16} />
  };

  // Generic subcategories for "all" platform
  const genericSubcategories = [
    {
      key: 'devices',
      name: t('categoryFilter.devices'),
      icon: subcategoryIcons.devices,
      categoryIds: [100, 200, 300, 400, 500, 600, 700]
    },
    {
      key: 'games',
      name: t('categoryFilter.games'),
      icon: subcategoryIcons.games,
      categoryIds: [101, 201, 301, 401, 501, 601, 701]
    },
    {
      key: 'accessories',
      name: t('categoryFilter.accessories'),
      icon: subcategoryIcons.accessories,
      categoryIds: [102, 202, 302, 402, 502, 602, 702]
    },
   
  ];

  // Platform configurations with icons
  const platforms = [
    {
      name: t('categoryFilter.all'),
      key: 'all',
      icon: <LayoutGrid size={18} />,
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      categoryId: null,
      subcategories: genericSubcategories
    },
    {
      name: t('categoryFilter.playstation'),
      key: 'playstation',
      icon: <Gamepad2 size={18} />,
      gradient: 'linear-gradient(135deg, #003791, #00439c)',
      categoryIds: [100, 101, 102],
      subcategories: [
        { key: 'devices', name: t('categoryFilter.console'), icon: subcategoryIcons.devices, categoryId: 100 },
        { key: 'games', name: t('categoryFilter.games'), icon: subcategoryIcons.games, categoryId: 101 },
        { key: 'accessories', name: t('categoryFilter.accessories'), icon: subcategoryIcons.accessories, categoryId: 102 }
      ]
    },
    {
      name: t('categoryFilter.xbox'),
      key: 'xbox',
      icon: <Gamepad2 size={18} />,
      gradient: 'linear-gradient(135deg, #107c10, #0e7a0d)',
      categoryIds: [200, 201, 202],
      subcategories: [
        { key: 'devices', name: t('categoryFilter.console'), icon: subcategoryIcons.devices, categoryId: 200 },
        { key: 'games', name: t('categoryFilter.games'), icon: subcategoryIcons.games, categoryId: 201 },
        { key: 'accessories', name: t('categoryFilter.accessories'), icon: subcategoryIcons.accessories, categoryId: 202 }
      ]
    },
    {
      name: t('categoryFilter.nintendo'),
      key: 'nintendo',
      icon: <Gamepad2 size={18} />,
      gradient: 'linear-gradient(135deg, #e60012, #ff0000)',
      categoryIds: [300, 301, 302],
      subcategories: [
        { key: 'devices', name: t('categoryFilter.console'), icon: subcategoryIcons.devices, categoryId: 300 },
        { key: 'games', name: t('categoryFilter.games'), icon: subcategoryIcons.games, categoryId: 301 },
        { key: 'accessories', name: t('categoryFilter.accessories'), icon: subcategoryIcons.accessories, categoryId: 302 }
      ]
    },
    {
      name: t('categoryFilter.pc'),
      key: 'pc',
      icon: <Monitor size={18} />,
      gradient: 'linear-gradient(135deg, #ff6b35, #ff4757)',
      categoryIds: [400, 401, 402],
      subcategories: [
        { key: 'devices', name: t('categoryFilter.devices'), icon: subcategoryIcons.devices, categoryId: 400 },
        { key: 'games', name: t('categoryFilter.games'), icon: subcategoryIcons.games, categoryId: 401 },
        { key: 'accessories', name: t('categoryFilter.accessories'), icon: subcategoryIcons.accessories, categoryId: 402 }
      ]
    },
    
  ];

  const currentPlatform = platforms.find(p => p.key === selectedPlatform);
  const subcategories = currentPlatform?.subcategories || [];

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform.key);
    setSelectedSubcategory('all');
    if (onFilterChange) {
      if (platform.key === 'all') {
        onFilterChange(null);
      } else if (platform.categoryIds) {
        onFilterChange(null, platform.categoryIds);
      } else {
        onFilterChange(platform.categoryId);
      }
    }
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory.key);
    if (onFilterChange) {
      if (subcategory.categoryIds) {
        onFilterChange(null, subcategory.categoryIds);
      } else {
        onFilterChange(subcategory.categoryId);
      }
    }
  };

  return (
    <div className="category-filter-modern">
      <div className="filter-container">
        {/* Platform Selection */}
        <div className="platform-section">
          <div className="platform-pills-modern">
            {platforms.map((platform) => (
              <button
                key={platform.key}
                className={`platform-pill-modern ${
                  selectedPlatform === platform.key ? 'active' : ''
                }`}
                onClick={() => handlePlatformChange(platform)}
                 
              >
                <span className="pill-icon">{platform.icon}</span>
                <span className="pill-text">{platform.name}</span>
                {selectedPlatform === platform.key && (
                  <span className="pill-indicator">
                    <Sparkles size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Filters */}
        <div className="subcategory-section">
          {subcategories.length > 0 && (
            <div className="subcategory-pills">
              <button
                className={`subcategory-pill ${
                  selectedSubcategory === 'all' ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedSubcategory('all');
                  if (onFilterChange) {
                    if (currentPlatform.categoryIds) {
                      onFilterChange(null, currentPlatform.categoryIds);
                    } else {
                      onFilterChange(currentPlatform.categoryId);
                    }
                  }
                }}
              >
                <LayoutGrid size={14} />
                <span>{t('categoryFilter.all')}</span>
              </button>
              
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory.key}
                  className={`subcategory-pill ${
                    selectedSubcategory === subcategory.key ? 'active' : ''
                  }`}
                  onClick={() => handleSubcategoryChange(subcategory)}
                >
                  {subcategory.icon}
                  <span>{subcategory.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;