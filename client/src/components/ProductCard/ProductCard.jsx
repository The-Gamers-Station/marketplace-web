import React from 'react';
import './ProductCard.css';

const ProductCard = ({ 
  title, 
  description, 
  price, 
  image, 
  platforms, 
  isHighlighted,
  badge 
}) => {
  return (
    <div className={`product-card ${isHighlighted ? 'highlighted' : ''}`}>
      {badge && <span className="product-badge">{badge}</span>}
      
      <div className="product-image">
        <img src={image || '/placeholder-game.jpg'} alt={title} />
        <div className="product-overlay">
          <button className="quick-view-btn">عرض سريع</button>
        </div>
      </div>

      <div className="product-content">
        <h3 className="product-title">{title}</h3>
        <p className="product-description">{description}</p>
        
        <div className="product-platforms">
          {platforms && platforms.map((platform, index) => (
            <span key={index} className="platform-tag">
              {platform}
            </span>
          ))}
        </div>

        <div className="product-footer">
          <div className="product-price">
            <span className="price-currency">ج.م</span>
            <span className="price-amount">{price}</span>
          </div>
          <button className="add-to-cart-btn">
            إضافة للسلة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;