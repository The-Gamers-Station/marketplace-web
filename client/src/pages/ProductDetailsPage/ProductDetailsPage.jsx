import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  ZoomIn,
  Loader2,
  MessageCircle
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import { postService } from '../../services/postService';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch product details
      const postData = await postService.getPostById(id);
      
      // Transform Post data to Product format
      const transformedProduct = {
        id: postData.id,
        name: postData.localizedTitle?.[currentLang] || postData.title || 'Untitled Product',
        arabicName: postData.localizedTitle?.ar || postData.title || 'منتج بدون اسم',
        price: postData.price || 0,
        originalPrice: postData.price ? Math.round(postData.price * 1.15) : 0, // Add 15% as original price
        discount: 14, // Calculate discount percentage
        rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10, // Generate random rating for now
        reviews: Math.floor(Math.random() * 500) + 50,
        sold: Math.floor(Math.random() * 1000) + 100,
        availability: postData.status === 'ACTIVE' ? t('pages.productDetails.available') : t('pages.productDetails.unavailable'),
        brand: 'GamersStation',
        category: postData.category?.localizedName?.[currentLang] || postData.category?.name || 'Gaming',
        sku: `GS-${postData.id}-${new Date().getFullYear()}`,
        images: postData.images?.length > 0
          ? postData.images.map(img => img.url || '/placeholder-game.jpg')
          : ['/placeholder-game.jpg'],
        variants: [
          { id: 'standard', name: t('pages.productDetails.variants.standard'), price: postData.price, available: true },
          { id: 'bundle', name: t('pages.productDetails.variants.withController'), price: Math.round(postData.price * 1.2), available: true },
          { id: 'premium', name: t('pages.productDetails.variants.premiumBundle'), price: Math.round(postData.price * 1.4), available: false }
        ],
        features: [
          t('pages.productDetails.highQualityGraphics'),
          t('pages.productDetails.warranty') + ' ' + t('pages.productDetails.oneYear'),
          t('pages.productDetails.onlineMultiplayer'),
          t('pages.productDetails.fastShipping'),
          t('pages.productDetails.returnPolicy') + ' ' + t('pages.productDetails.withinDays', { days: 14 }),
          t('pages.productDetails.exclusiveContent')
        ],
        description: postData.localizedDescription?.[currentLang] || postData.description || 'منتج عالي الجودة من GamersStation',
        specifications: {
          [t('pages.productDetails.condition.label')]: postData.condition === 'NEW' ? t('pages.productDetails.condition.new') : t('pages.productDetails.condition.used'),
          [t('pages.productDetails.city')]: postData.location?.city?.localizedName?.[currentLang] || postData.location?.city?.name || 'Riyadh',
          [t('pages.productDetails.publishDate')]: new Date(postData.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US'),
          [t('pages.productDetails.adNumber')]: postData.id,
          [t('pages.productDetails.views')]: postData.viewCount || 0,
          [t('pages.productDetails.warranty')]: t('pages.productDetails.oneYear')
        },
        seller: {
          name: postData.seller?.store?.name || postData.seller?.username || 'GamersStation',
          rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
          responseTime: currentLang === 'ar' ? '1 ساعة' : '1 hour',
          products: Math.floor(Math.random() * 200) + 50,
          verified: postData.seller?.store?.verified || true
        }
      };
      
      setProduct(transformedProduct);
      
      // Fetch related products from same category
      const relatedData = await postService.getPosts({
        categoryId: postData.category?.id,
        page: 1,
        size: 5
      });
      
      const transformedRelated = relatedData.content
        .filter(post => post.id !== postData.id)
        .slice(0, 4)
        .map(post => ({
          id: post.id,
          name: post.localizedTitle?.[currentLang] || post.title,
          price: post.price,
          rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
          image: post.images?.[0]?.url || '/placeholder-game.jpg'
        }));
        
      setRelatedProducts(transformedRelated);
      
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
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

  // Structured data will be computed only when product is loaded (below, after guards)
  // to avoid accessing properties on null during the initial render.

  if (loading) {
    return (
      <div className="product-details-page">
        <Header />
        <div className="loading-container">
          <Loader2 className="spinner" size={48} />
          <p>{t('common.loading')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <Header />
        <div className="error-container">
          <p>{error || t('common.error')}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            {t('common.back')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Now it's safe to build structured data (product is defined here)
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": Array.isArray(product.images) && product.images.length > 0 ? product.images : [],
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
      "url": `${window.location.origin}/product/${product.id}`,
      "priceCurrency": "SAR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": product.seller.name
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
        description={`${t('pages.productDetails.buyNow')} ${product.name} ${t('productCard.sar')} ${product.price}. ${product.description}`}
        keywords={`${product.name}, ${product.arabicName}, ${product.brand}, ${product.category}, GamersStation`}
        type="product"
        image={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : undefined}
        structuredData={productStructuredData}
      />
      <div className="product-details-page">
        <Header />
      
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <a href="/">{t('pages.productDetails.home')}</a>
          <ChevronLeft size={16} />
          <span>{i18n.language === 'ar' ? product.arabicName : product.name}</span>
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
                    {t('pages.productDetails.bestSeller')}
                  </span>
                  <span className="badge-verified">
                    <Check size={14} />
                    {t('pages.productDetails.originalProduct')}
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
                    <span className="reviews-count">({product.reviews} {t('pages.productDetails.reviews')})</span>
                  </div>
                  <div className="meta-separator">•</div>
                  <div className="sold-count">
                    <Package size={16} />
                    <span>{product.sold} {t('pages.productDetails.itemsSold')}</span>
                  </div>
                  <div className="meta-separator">•</div>
                  <div className="sku">
                    {t('pages.productDetails.sku')}: {product.sku}
                  </div>
                </div>
              </div>

              {/* Mobile Product Gallery - Show only on mobile */}
              <div className="product-gallery mobile-only">
                <div className="main-image-container">
                  <div className="discount-badge">
                    <span>-{product.discount}%</span>
                  </div>
                  <button
                    className="gallery-nav prev"
                    onClick={prevImage}
                    aria-label={t('imageAlt.previousImage')}
                  >
                    <ChevronRight size={24} />
                  </button>
                  <button
                    className="gallery-nav next"
                    onClick={nextImage}
                    aria-label={t('imageAlt.nextImage')}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    className="zoom-btn"
                    onClick={() => setShowZoom(true)}
                    aria-label={t('imageAlt.zoomImage')}
                  >
                    <ZoomIn size={20} />
                  </button>
                  <div className="main-image">
                    {product.images[selectedImage].startsWith('http') ? (
                      <OptimizedImage
                        src={product.images[selectedImage]}
                        alt={product.name}
                        className="product-main-image"
                        priority={true}
                        objectFit="contain"
                      />
                    ) : (
                      <span className="product-emoji">{product.images[selectedImage]}</span>
                    )}
                  </div>
                </div>
                
                <div className="thumbnail-list">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => handleImageSelect(index)}
                    >
                      {image.startsWith('http') ? (
                        <img
                          src={image}
                          alt={t('imageAlt.productImageNumber', { productName: product.name, number: index + 1 })}
                          className="thumbnail-image"
                        />
                      ) : (
                        <span>{image}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="price-section">
                <div className="price-container">
                  <div className="current-price">
                    <span className="price-value">{product.price}</span>
                    <span className="currency">{t('currency')}</span>
                  </div>
                  <div className="original-price">
                    <span>{product.originalPrice} {t('currency')}</span>
                  </div>
                  <div className="savings">
                    {t('pages.productDetails.save')} {product.originalPrice - product.price} {t('currency')}
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="variants-section">
                <h2>{t('pages.productDetails.availableOptions')}</h2>
                <div className="variants-list">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`variant-option ${selectedVariant === variant.id ? 'selected' : ''} ${!variant.available ? 'disabled' : ''}`}
                      onClick={() => variant.available && setSelectedVariant(variant.id)}
                      disabled={!variant.available}
                    >
                      <span className="variant-name">{variant.name}</span>
                      <span className="variant-price">{variant.price} {t('currency')}</span>
                      {!variant.available && <span className="out-of-stock">{t('pages.productDetails.outOfStock')}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Features */}
              <div className="quick-features">
                <div className="feature-item">
                  <Shield className="feature-icon" />
                  <div className="feature-text">
                    <strong>{t('pages.productDetails.originalWarranty')}</strong>
                    <span>{t('pages.productDetails.fullYear')}</span>
                  </div>
                </div>
                <div className="feature-item">
                  <Truck className="feature-icon" />
                  <div className="feature-text">
                    <strong>{t('pages.productDetails.fastDelivery')}</strong>
                    <span>{t('pages.productDetails.within2to3Days')}</span>
                  </div>
                </div>
                <div className="feature-item">
                  <RefreshCw className="feature-icon" />
                  <div className="feature-text">
                    <strong>{t('pages.productDetails.freeReturns')}</strong>
                    <span>{t('pages.productDetails.within14Days')}</span>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              {/* <div className="purchase-section">
                <div className="quantity-selector">
                  <label>{t('pages.productDetails.quantity')}</label>
                  <div className="quantity-controls">
                    <button onClick={() => handleQuantityChange('decrease')} aria-label={t('pages.productDetails.decreaseQuantity')}>
                      <Minus size={18} />
                    </button>
                    <input type="number" value={quantity} readOnly />
                    <button onClick={() => handleQuantityChange('increase')} aria-label={t('pages.productDetails.increaseQuantity')}>
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="btn-add-cart">
                    <ShoppingCart size={20} />
                    {t('pages.productDetails.addToCart')}
                  </button>
                  <button className="btn-buy-now">
                    {t('pages.productDetails.buyNow')}
                  </button>
                  <button
                    className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart size={20} />
                  </button>
                  <button className="btn-share" aria-label={t('pages.productDetails.shareProduct')}>
                    <Share2 size={20} />
                  </button>
                </div>
              </div> */}

              {/* Delivery Info */}
              <div className="delivery-info">
                <MapPin size={18} />
                <div>
                  <strong>{t('pages.productDetails.deliverTo')}</strong>
                  <a href="#">{t('pages.productDetails.riyadhNakhil')}</a>
                  <span className="delivery-time">{t('pages.productDetails.deliveryTime')}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="seller-info">
                <div className="seller-header">
                  <h2>{t('pages.productDetails.seller')}</h2>
                  {product.seller.verified && (
                    <span className="verified-badge">
                      <Award size={14} />
                      {t('pages.productDetails.verified')}
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
                    <span>{product.seller.products} {t('pages.productDetails.product')}</span>
                    <span>•</span>
                    <span>{t('pages.productDetails.responseWithin')} {product.seller.responseTime}</span>
                  </div>
                  <div className="seller-actions">
                    <a href="#" className="visit-store">{t('pages.productDetails.visitStore')}</a>
                    <button
                      className="chat-with-seller-btn"
                      onClick={() => navigate(`/chat/${product.id}`, {
                        state: {
                          productId: product.id,
                          productName: product.name,
                          sellerName: product.seller.name,
                          sellerId: product.seller.id
                        }
                      })}
                    >
                      <MessageCircle size={18} />
                      {t('pages.productDetails.chatWithSeller')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Product Gallery - Desktop Only */}
            <div className="product-gallery desktop-only">
              <div className="main-image-container">
                <div className="discount-badge">
                  <span>-{product.discount}%</span>
                </div>
                <button 
                  className="gallery-nav prev"
                  onClick={prevImage}
                  aria-label={t('imageAlt.previousImage')}
                >
                  <ChevronRight size={24} />
                </button>
                <button 
                  className="gallery-nav next"
                  onClick={nextImage}
                  aria-label={t('imageAlt.nextImage')}
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  className="zoom-btn"
                  onClick={() => setShowZoom(true)}
                  aria-label={t('imageAlt.zoomImage')}
                >
                  <ZoomIn size={20} />
                </button>
                <div className="main-image">
                  {product.images[selectedImage].startsWith('http') ? (
                    <OptimizedImage
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="product-main-image"
                      priority={true}
                      objectFit="contain"
                    />
                  ) : (
                    <span className="product-emoji">{product.images[selectedImage]}</span>
                  )}
                </div>
              </div>
              
              <div className="thumbnail-list">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => handleImageSelect(index)}
                  >
                    {image.startsWith('http') ? (
                      <img
                        src={image}
                        alt={t('imageAlt.productImageNumber', { productName: product.name, number: index + 1 })}
                        className="thumbnail-image"
                      />
                    ) : (
                      <span>{image}</span>
                    )}
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
                {t('pages.productDetails.description')}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                {t('pages.productDetails.features')}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                {t('pages.productDetails.specifications')}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                {t('pages.productDetails.reviews')} ({product.reviews})
              </button>
            </div>

            <div className="tabs-content">
              {activeTab === 'description' && (
                <div className="tab-panel description-panel">
                  <h2>{t('pages.productDetails.productDescription')}</h2>
                  <p>{product.description}</p>
                  <div className="highlights">
                    <h2>{t('pages.productDetails.keyFeatures')}</h2>
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
                  <h2>{t('pages.productDetails.productFeatures')}</h2>
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
                  <h2>{t('pages.productDetails.technicalSpecs')}</h2>
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
                    <h2>{t('pages.productDetails.customerReviews')}</h2>
                    <button className="write-review-btn">
                      <MessageSquare size={18} />
                      {t('pages.productDetails.writeReview')}
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
                      <div className="total-reviews">{t('pages.productDetails.basedOn')} {product.reviews} {t('pages.productDetails.review')}</div>
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
                          <button className="helpful-btn" aria-label={`${t('pages.productDetails.markReviewHelpful')} - ${review.helpful} ${t('pages.productDetails.peopleFoundHelpful')}`}>
                            <ThumbsUp size={16} />
                            {t('pages.productDetails.helpful')} ({review.helpful})
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
                  <span className="title-text">{t('pages.productDetails.relatedProducts')}</span>
                  <span className="title-decoration"></span>
                </h2>
                <p className="related-subtitle">{t('pages.productDetails.discoverMore')}</p>
              </div>
              
              <div className="related-controls">
                <button className="control-btn prev" onClick={prevImage} aria-label={t('pages.productDetails.previous')}>
                  <ChevronRight size={20} />
                </button>
                <button className="control-btn next" onClick={nextImage} aria-label={t('pages.productDetails.next')}>
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>
            
            <div className="related-carousel">
              <div className="carousel-track">
                {relatedProducts.map((item, index) => (
                  <a
                    key={item.id}
                    href={`/product/${item.id}`}
                    className="modern-product-card"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/product/${item.id}`);
                    }}
                  >
                    {/* Card Background Effects */}
                    <div className="card-bg-effect"></div>
                    <div className="card-glow"></div>
                    
                    {/* Badges */}
                    <div className="card-badges">
                      {index === 0 && (
                        <span className="badge badge-hot">
                          <Zap size={12} />
                          {t('pages.productDetails.hotDeal')}
                        </span>
                      )}
                      {index === 1 && (
                        <span className="badge badge-new">{t('pages.productDetails.new')}</span>
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
                        {item.image.startsWith('http') ? (
                          <OptimizedImage
                            src={item.image}
                            alt={item.name}
                            className="related-product-image"
                            objectFit="cover"
                          />
                        ) : (
                          <span className="product-emoji">{item.image}</span>
                        )}
                      </div>
                      <div className="image-shadow"></div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="product-info-section">
                      <h2 className="product-name">{item.name}</h2>
                      
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
                        <span className="sold-count">{Math.floor(Math.random() * 100) + 50} {t('pages.productDetails.sold')}</span>
                      </div>
                      
                      {/* Price Section */}
                      <div className="price-area">
                        <div className="price-group">
                          {index === 0 && (
                            <span className="original-price">{item.price + 100} {t('currency')}</span>
                          )}
                          <div className="current-price">
                            <span className="price-number">{item.price}</span>
                            <span className="price-currency">{t('currency')}</span>
                          </div>
                        </div>
                        
                        {index === 0 && (
                          <div className="discount-percentage">
                            <span>-{Math.floor((100 / (item.price + 100)) * 100)}%</span>
                          </div>
                        )}
                      </div>
                      
                       
                    </div>
                  </a>
                ))}
                
                {/* View All Card */}
                <div className="modern-product-card view-more-card">
                  <div className="view-more-content">
                    <div className="icon-wrapper">
                      <Package size={56} />
                      <div className="icon-bg-circle"></div>
                    </div>
                    <h2>{t('pages.productDetails.exploreMore')}</h2>
                    <p className="products-count">{t('pages.productDetails.amazingProducts')}</p>
                    <button className="explore-btn" aria-label={t('pages.productDetails.viewAllProducts')}>
                      <span>{t('pages.productDetails.viewAllProducts')}</span>
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
          <button className="close-zoom" onClick={() => setShowZoom(false)} aria-label={t('pages.productDetails.closeZoom')}>
            <X size={24} />
          </button>
          <div className="zoom-content">
            {product.images[selectedImage].startsWith('http') ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="zoomed-image"
              />
            ) : (
              <span className="zoomed-image">{product.images[selectedImage]}</span>
            )}
          </div>
        </div>
      )}

        <Footer />
      </div>
    </>
  );
};

export default ProductDetailsPage;