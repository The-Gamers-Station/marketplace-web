import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Shield,
  Truck,
  RefreshCw,
  Check,
  MapPin,
  Plus,
  Minus,
  ThumbsUp,
  MessageSquare,
  Award,
  Package,
  Zap,
  Info,
  X,
  ZoomIn
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('standard');

  // Sample product data
  const product = {
    id: 1,
    name: 'PlayStation 5 Console - Digital Edition',
    arabicName: 'بلايستيشن 5 - الإصدار الرقمي',
    price: 1899,
    originalPrice: 2199,
    discount: 14,
    rating: 4.8,
    reviews: 324,
    sold: 1250,
    availability: 'متوفر',
    brand: 'Sony',
    category: 'Gaming Consoles',
    sku: 'PS5-DIG-2024',
    images: [
      '🎮',
      '📦',
      '🎯',
      '🕹️',
      '💿'
    ],
    variants: [
      { id: 'standard', name: 'Standard', price: 1899, available: true },
      { id: 'bundle', name: 'With Extra Controller', price: 2299, available: true },
      { id: 'premium', name: 'Premium Bundle', price: 2699, available: false }
    ],
    features: [
      'معالج AMD Zen 2 ثماني النواة',
      'معالج رسوميات AMD RDNA 2',
      'ذاكرة 16GB GDDR6',
      'تخزين SSD سعة 825GB',
      'دعم Ray Tracing',
      'دقة تصل إلى 8K',
      'معدل إطارات يصل إلى 120fps',
      'تقنية الصوت ثلاثي الأبعاد'
    ],
    description: 'استمتع بتجربة اللعب المذهلة مع PlayStation 5 Digital Edition. يوفر هذا الجهاز قوة معالجة فائقة وسرعة تحميل خاطفة بفضل تقنية SSD المتطورة. استمتع بالرسومات المذهلة بدقة 4K وتقنية Ray Tracing للحصول على أفضل تجربة بصرية.',
    specifications: {
      'المعالج': 'AMD Zen 2 - 8 أنوية',
      'معالج الرسوميات': 'AMD RDNA 2 - 10.3 TFLOPS',
      'الذاكرة': '16GB GDDR6',
      'التخزين': '825GB SSD',
      'الأبعاد': '39 × 10.4 × 26 سم',
      'الوزن': '3.9 كجم',
      'الاتصال': 'Wi-Fi 6, Bluetooth 5.1, USB Type-A & C',
      'الضمان': 'سنة واحدة'
    },
    seller: {
      name: 'متجر الألعاب المتميز',
      rating: 4.7,
      responseTime: '1 ساعة',
      products: 156,
      verified: true
    }
  };

  const reviews = [
    {
      id: 1,
      user: 'أحمد محمد',
      avatar: '👤',
      rating: 5,
      date: 'منذ 3 أيام',
      comment: 'جهاز ممتاز وسرعة التحميل خيالية! الرسومات مذهلة والأداء فوق الممتاز.',
      helpful: 45,
      images: ['🎮']
    },
    {
      id: 2,
      user: 'سارة أحمد',
      avatar: '👩',
      rating: 4,
      date: 'منذ أسبوع',
      comment: 'الجهاز رائع لكن كنت أتمنى توفر المزيد من الألعاب الحصرية.',
      helpful: 23
    },
    {
      id: 3,
      user: 'خالد العمري',
      avatar: '👨',
      rating: 5,
      date: 'منذ أسبوعين',
      comment: 'أفضل جهاز ألعاب جربته! يستحق كل ريال.',
      helpful: 67
    }
  ];

  const relatedProducts = [
    { id: 2, name: 'DualSense Controller', price: 299, rating: 4.6, image: '🎮' },
    { id: 3, name: 'PS5 Headset', price: 449, rating: 4.7, image: '🎧' },
    { id: 4, name: 'PS5 Camera', price: 249, rating: 4.5, image: '📸' },
    { id: 5, name: 'Media Remote', price: 129, rating: 4.3, image: '📱' }
  ];

  const handleQuantityChange = (action) => {
    if (action === 'increase') {
      setQuantity(quantity + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Generate structured data for the product
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [
      "https://gamersstation.eg/products/ps5-digital-1.jpg",
      "https://gamersstation.eg/products/ps5-digital-2.jpg",
      "https://gamersstation.eg/products/ps5-digital-3.jpg"
    ],
    "description": product.description,
    "sku": product.sku,
    "mpn": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": `https://gamersstation.eg/product/${product.id}`,
      "priceCurrency": "EGP",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": product.seller.name
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "50",
          "currency": "EGP"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "EG"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          }
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Person",
        "name": review.user
      },
      "datePublished": new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      "reviewBody": review.comment
    }))
  };

  return (
    <>
      <SEO
        title={`${product.name} - ${product.arabicName}`}
        description={`اشتري ${product.name} بأفضل سعر ${product.price} جنيه مصري. ${product.description}. توصيل سريع وضمان أصلي.`}
        keywords={`${product.name}, ${product.arabicName}, ${product.brand}, ${product.category}, PlayStation 5, PS5, ألعاب إلكترونية, مصر`}
        type="product"
        image="https://gamersstation.eg/products/ps5-digital-main.jpg"
        structuredData={productStructuredData}
      />
      <div className="product-details-page">
        <Header />
      
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <a href="/">الرئيسية</a>
          <ChevronLeft size={16} />
          {/* <a href="/category">أجهزة الألعاب</a> */}
          {/* <ChevronLeft size={16} /> */}
          <span>{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <section className="product-section">
        <div className="container">
          <div className="product-contentt">
{/* Product Info */}
            <div className="product-info">
              <div className="product-header">
                <div className="badges">
                  <span className="badge-bestseller">
                    <Zap size={14} />
                    الأكثر مبيعاً
                  </span>
                  <span className="badge-verified">
                    <Check size={14} />
                    منتج أصلي
                  </span>
                </div>
                <h1 className="product-title">{product.name}</h1>
                <p className="product-subtitle">{product.arabicName}</p>
                
                <div className="product-meta">
                  <div className="rating-info">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          className={i < Math.floor(product.rating) ? 'filled' : ''}
                        />
                      ))}
                    </div>
                    <span className="rating-value">{product.rating}</span>
                    <span className="reviews-count">({product.reviews} تقييم)</span>
                  </div>
                  <div className="meta-separator">•</div>
                  <div className="sold-count">
                    <Package size={16} />
                    <span>{product.sold} قطعة بيعت</span>
                  </div>
                  <div className="meta-separator">•</div>
                  <div className="sku">
                    SKU: {product.sku}
                  </div>
                </div>
              </div>

              <div className="price-section">
                <div className="price-container">
                  <div className="current-price">
                    <span className="price-value">{product.price}</span>
                    <span className="currency">ر.س</span>
                  </div>
                  <div className="original-price">
                    <span>{product.originalPrice} ر.س</span>
                  </div>
                  <div className="savings">
                    وفر {product.originalPrice - product.price} ر.س
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="variants-section">
                <h3>الخيارات المتاحة:</h3>
                <div className="variants-list">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`variant-option ${selectedVariant === variant.id ? 'selected' : ''} ${!variant.available ? 'disabled' : ''}`}
                      onClick={() => variant.available && setSelectedVariant(variant.id)}
                      disabled={!variant.available}
                    >
                      <span className="variant-name">{variant.name}</span>
                      <span className="variant-price">{variant.price} ر.س</span>
                      {!variant.available && <span className="out-of-stock">نفذ المخزون</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Features */}
              <div className="quick-features">
                <div className="feature-item">
                  <Shield className="feature-icon" />
                  <div className="feature-text">
                    <strong>ضمان أصلي</strong>
                    <span>سنة كاملة</span>
                  </div>
                </div>
                <div className="feature-item">
                  <Truck className="feature-icon" />
                  <div className="feature-text">
                    <strong>توصيل سريع</strong>
                    <span>خلال 2-3 أيام</span>
                  </div>
                </div>
                <div className="feature-item">
                  <RefreshCw className="feature-icon" />
                  <div className="feature-text">
                    <strong>إرجاع مجاني</strong>
                    <span>خلال 14 يوم</span>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label>الكمية:</label>
                  <div className="quantity-controls">
                    <button onClick={() => handleQuantityChange('decrease')}>
                      <Minus size={18} />
                    </button>
                    <input type="number" value={quantity} readOnly />
                    <button onClick={() => handleQuantityChange('increase')}>
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="btn-add-cart">
                    <ShoppingCart size={20} />
                    أضف للسلة
                  </button>
                  <button className="btn-buy-now">
                    اشتري الآن
                  </button>
                  <button 
                    className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart size={20} />
                  </button>
                  <button className="btn-share">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="delivery-info">
                <MapPin size={18} />
                <div>
                  <strong>التوصيل إلى:</strong>
                  <a href="#">الرياض - حي النخيل</a>
                  <span className="delivery-time">التوصيل خلال 2-3 أيام عمل</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="seller-info">
                <div className="seller-header">
                  <h3>البائع</h3>
                  {product.seller.verified && (
                    <span className="verified-badge">
                      <Award size={14} />
                      موثق
                    </span>
                  )}
                </div>
                <div className="seller-details">
                  <div className="seller-name">{product.seller.name}</div>
                  <div className="seller-stats">
                    <span>
                      <Star size={14} />
                      {product.seller.rating}
                    </span>
                    <span>•</span>
                    <span>{product.seller.products} منتج</span>
                    <span>•</span>
                    <span>رد خلال {product.seller.responseTime}</span>
                  </div>
                  <a href="#" className="visit-store">زيارة المتجر</a>
                </div>
              </div>
            </div>
            {/* Product Gallery */}
            <div className="product-gallery">
              <div className="main-image-container">
                <div className="discount-badge">
                  <span>-{product.discount}%</span>
                </div>
                <button 
                  className="gallery-nav prev" 
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronRight size={24} />
                </button>
                <button 
                  className="gallery-nav next" 
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  className="zoom-btn"
                  onClick={() => setShowZoom(true)}
                  aria-label="Zoom image"
                >
                  <ZoomIn size={20} />
                </button>
                <div className="main-image">
                  <span className="product-emoji">{product.images[selectedImage]}</span>
                </div>
              </div>
              
              <div className="thumbnail-list">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => handleImageSelect(index)}
                  >
                    <span>{image}</span>
                  </button>
                ))}
              </div>
            </div>

            

          </div>

          {/* Product Details Tabs */}
          <div className="product-details-tabs">
            <div className="tabs-header">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                الوصف
              </button>
              <button 
                className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                المميزات
              </button>
              <button 
                className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                المواصفات
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                التقييمات ({product.reviews})
              </button>
            </div>

            <div className="tabs-content">
              {activeTab === 'description' && (
                <div className="tab-panel description-panel">
                  <h2>وصف المنتج</h2>
                  <p>{product.description}</p>
                  <div className="highlights">
                    <h3>أهم المميزات:</h3>
                    <ul>
                      {product.features.slice(0, 4).map((feature, index) => (
                        <li key={index}>
                          <Check size={16} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="tab-panel features-panel">
                  <h2>مميزات المنتج</h2>
                  <div className="features-grid">
                    {product.features.map((feature, index) => (
                      <div key={index} className="feature-card">
                        <div className="feature-icon-wrapper">
                          <Zap size={24} />
                        </div>
                        <p>{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="tab-panel specifications-panel">
                  <h2>المواصفات الفنية</h2>
                  <table className="specs-table">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], index) => (
                        <tr key={index}>
                          <td className="spec-label">{key}</td>
                          <td className="spec-value">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="tab-panel reviews-panel">
                  <div className="reviews-header">
                    <h2>تقييمات العملاء</h2>
                    <button className="write-review-btn">
                      <MessageSquare size={18} />
                      اكتب تقييم
                    </button>
                  </div>
                  
                  <div className="rating-summary">
                    <div className="overall-rating">
                      <div className="rating-number">{product.rating}</div>
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={20} 
                            className={i < Math.floor(product.rating) ? 'filled' : ''}
                          />
                        ))}
                      </div>
                      <div className="total-reviews">بناءً على {product.reviews} تقييم</div>
                    </div>
                    
                    <div className="rating-bars">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="rating-bar-item">
                          <span className="star-label">{rating} ⭐</span>
                          <div className="bar-container">
                            <div 
                              className="bar-fill" 
                              style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 10}%` }}
                            ></div>
                          </div>
                          <span className="bar-percentage">
                            {rating === 5 ? '70%' : rating === 4 ? '20%' : '10%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-avatar">{review.avatar}</span>
                            <div>
                              <div className="reviewer-name">{review.user}</div>
                              <div className="review-meta">
                                <div className="review-stars">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={14} 
                                      className={i < review.rating ? 'filled' : ''}
                                    />
                                  ))}
                                </div>
                                <span className="review-date">{review.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        {review.images && (
                          <div className="review-images">
                            {review.images.map((img, i) => (
                              <span key={i} className="review-image">{img}</span>
                            ))}
                          </div>
                        )}
                        <div className="review-footer">
                          <button className="helpful-btn">
                            <ThumbsUp size={16} />
                            مفيد ({review.helpful})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products - Modern UI */}
          <div className="related-products-modern">
            <div className="related-header">
              <div className="related-title-section">
                <h2 className="related-title">
                  <span className="title-text">منتجات ذات صلة</span>
                  <span className="title-decoration"></span>
                </h2>
                <p className="related-subtitle">اكتشف المزيد من المنتجات المميزة التي قد تعجبك</p>
              </div>
              
              <div className="related-controls">
                <button className="control-btn prev" onClick={prevImage} aria-label="السابق">
                  <ChevronRight size={20} />
                </button>
                <button className="control-btn next" onClick={nextImage} aria-label="التالي">
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>
            
            <div className="related-carousel">
              <div className="carousel-track">
                {relatedProducts.map((item, index) => (
                  <div key={item.id} className="modern-product-card">
                    {/* Card Background Effects */}
                    <div className="card-bg-effect"></div>
                    <div className="card-glow"></div>
                    
                    {/* Badges */}
                    <div className="card-badges">
                      {index === 0 && (
                        <span className="badge badge-hot">
                          <Zap size={12} />
                          عرض ساخن
                        </span>
                      )}
                      {index === 1 && (
                        <span className="badge badge-new">جديد</span>
                      )}
                      {item.rating >= 4.5 && (
                        <span className="badge badge-rating">
                          <Star size={12} />
                          {item.rating}
                        </span>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="quick-actions">
                      <button className="quick-action-btn" aria-label="Add to wishlist">
                        <Heart size={18} />
                      </button>
                      <button className="quick-action-btn" aria-label="Quick view">
                        <Info size={18} />
                      </button>
                    </div>
                    
                    {/* Product Image */}
                    <div className="product-image-wrapper">
                      <div className="image-container">
                        <div className="image-shimmer"></div>
                        <span className="product-emoji">{item.image}</span>
                      </div>
                      <div className="image-shadow"></div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="product-info-section">
                      <h3 className="product-name">{item.name}</h3>
                      
                      {/* Rating and Reviews */}
                      <div className="product-meta">
                        <div className="rating-section">
                          <div className="stars-container">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < Math.floor(item.rating) ? 'star filled' : 'star'}
                              />
                            ))}
                          </div>
                          <span className="rating-text">{item.rating}</span>
                        </div>
                        <span className="separator">•</span>
                        <span className="sold-count">{Math.floor(Math.random() * 100) + 50} تم البيع</span>
                      </div>
                      
                      {/* Price Section */}
                      <div className="price-area">
                        <div className="price-group">
                          {index === 0 && (
                            <span className="original-price">{item.price + 100} ر.س</span>
                          )}
                          <div className="current-price">
                            <span className="price-number">{item.price}</span>
                            <span className="price-currency">ر.س</span>
                          </div>
                        </div>
                        
                        {index === 0 && (
                          <div className="discount-percentage">
                            <span>-{Math.floor((100 / (item.price + 100)) * 100)}%</span>
                          </div>
                        )}
                      </div>
                      
                       
                    </div>
                  </div>
                ))}
                
                {/* View All Card */}
                <div className="modern-product-card view-more-card">
                  <div className="view-more-content">
                    <div className="icon-wrapper">
                      <Package size={56} />
                      <div className="icon-bg-circle"></div>
                    </div>
                    <h3>استكشف المزيد</h3>
                    <p className="products-count">+100 منتج رائع</p>
                    <button className="explore-btn">
                      <span>عرض جميع المنتجات</span>
                      <ChevronLeft size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Carousel Indicators */}
              {/* <div className="carousel-indicators">
                {[...Array(Math.ceil((relatedProducts.length + 1) / 4))].map((_, i) => (
                  <button
                    key={i}
                    className={`indicator ${i === 0 ? 'active' : ''}`}
                    aria-label={`Go to slide ${i + 1}`}
                  ></button>
                ))}
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Image Zoom Modal */}
      {showZoom && (
        <div className="zoom-modal" onClick={() => setShowZoom(false)}>
          <button className="close-zoom" onClick={() => setShowZoom(false)}>
            <X size={24} />
          </button>
          <div className="zoom-content">
            <span className="zoomed-image">{product.images[selectedImage]}</span>
          </div>
        </div>
      )}

        <Footer />
      </div>
    </>
  );
};

export default ProductDetailsPage;