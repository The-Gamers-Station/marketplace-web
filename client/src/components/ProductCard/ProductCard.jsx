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
  platforms,
  isHighlighted,
  badge,
  username,
  location,
  type,
}) => {
  const { t } = useTranslation();
  
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
        {/* Title Section */}
        <h3 className="product-titlee">{title}</h3>

        {/* Platforms Tags */}
        {platforms && platforms.length > 0 && (
          <div className="product-platforms">
            {platforms.slice(0, 2).map((platform, index) => (
              <span key={index} className="platform-tag">{platform}</span>
            ))}
            {platforms.length > 2 && (
              <span className="platform-tag more">+{platforms.length - 2}</span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="current-price">
          <span className="price-currency">{t('currency')}</span>
          <span className="price-valuee">{price || '0'}</span>
        </div>

        {/* User Info at Bottom */}
        <div className="user-info-bottom">
          <span className="username-text">{username || t('anonymous')}</span>
          {location && (
            <>
              <span className="separator">|</span>
              <span className="location-text">
                <MapPin size={10} />
                {getTranslatedCityName(location, t)}
              </span>
            </>
          )}
        </div>
      </div>
    </a>
  );
};

export default ProductCard;
