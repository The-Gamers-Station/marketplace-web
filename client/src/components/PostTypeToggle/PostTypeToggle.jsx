import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Search } from 'lucide-react';
import './PostTypeToggle.css';

const PostTypeToggle = ({ selectedType, onTypeChange }) => {
  const { t } = useTranslation();

  const handleToggle = (type) => {
    // If clicking the same type, deselect (show all)
    if (selectedType === type) {
      onTypeChange(null);
    } else {
      onTypeChange(type);
    }
  };

  return (
    <div className="post-type-toggle">
      <div className="toggle-container">
        <button
          className={`toggle-btn ${selectedType === 'SELL' ? 'active' : ''}`}
          onClick={() => handleToggle('SELL')}
          aria-pressed={selectedType === 'SELL'}
        >
          <ShoppingBag size={16} />
          <span>{t('postTypeToggle.forSale')}</span>
        </button>
        
        <button
          className={`toggle-btn ${selectedType === 'ASK' ? 'active' : ''}`}
          onClick={() => handleToggle('ASK')}
          aria-pressed={selectedType === 'ASK'}
        >
          <Search size={16} />
          <span>{t('postTypeToggle.wanted')}</span>
        </button>
      </div>
    </div>
  );
};

export default PostTypeToggle;
