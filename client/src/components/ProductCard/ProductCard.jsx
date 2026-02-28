import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, MapPin, Check, Package } from 'lucide-react';
import { getTranslatedCityName } from '../../utils/cityTranslations';
import './ProductCard.css';

const ProductCard = ({
  id,
  title,
  price,
  image,
  isHighlighted,
  badge,
  username,
  location,
  type,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const handleCardClick = (e) => {
    e.preventDefault();
    // Force page refresh by using window.location
    window.location.href = `/product/${id}`;
  };

  return (
    <a href={`/product/${id}`} className={`product-card ${isHighlighted ? 'highlighted' : ''}`} onClick={handleCardClick} style={{ textDecoration: 'none', color: 'inherit' }}>
      {badge && (
        <div className="badge-container">
          <span className="product-badge">{badge}</span>
        </div>
      )}
      
      {/* Type Badge */}
      <div className={`product-type-badge ${type === 'ASK' ? 'type-ask' : 'type-sell'}`}>
        {type === 'ASK' ? (
          <>
            <Package size={14} />
            <span>{t('productType.wanted')}</span>
          </>
        ) : (
          <>
            <Check size={14} />
            <span>{t('productType.forSale')}</span>
          </>
        )}
      </div>
      
      <div className="product-image">
        <img
          src={image || '/placeholder-game.svg'}
          alt={t('imageAlt.productImage', { productName: title }) || title}
          className="product-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-game.svg';
          }}
        />
      </div>

      <div className="product-content">
        {/* User Info Section - Enhanced */}
        <div className="user-info-section">
          <div className="user-avatar">
            <User size={16} />
          </div>
          <div className="user-details">
            <div className="user-name">
              <span className="username-text">{username || t('anonymous')}</span>
            </div>
            {location && (
              <div className="user-location">
                <MapPin size={11} />
                <span>{getTranslatedCityName(location, t)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info Section */}
         <div className="product-info">
          <h3 className="product-titlee">{title}</h3>
        </div>


        {/* Price Section - At Bottom of Card */}
        <div className="current-price">
          {isArabic ? (
            <>
              <span className="price-currency">{t('currency')}</span>
              <span className="price-valuee">{price || '0'}</span>
            </>
          ) : (
            <>
              <span className="price-valuee">{price || '0'}</span>
              <span className="price-currency">{t('currency')}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
};

export default ProductCard;
