import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Share2,
  Shield,
  MapPin,
  Calendar,
  Eye,
  Loader2,
  MessageCircle,
  User,
  Check,
  Package,
  Gamepad2
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import { postService } from '../../services/postService';
import messagingService from '../../services/messagingService';
import authService from '../../services/authService';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(false);

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
        category: postData.categoryName || 'Gaming',
        categoryId: postData.categoryId,
        sku: `GS-${postData.id}-${new Date().getFullYear()}`,
        images: postData.images?.length > 0
          ? postData.images.map(img => img.url || '/placeholder-game.jpg')
          : ['/placeholder-game.jpg', '/placeholder-game.jpg', '/placeholder-game.jpg', '/placeholder-game.jpg'], // Add multiple placeholders for testing
        description: postData.localizedDescription?.[currentLang] || postData.description || 'منتج عالي الجودة من GamersStation',
        specifications: {
          [t('pages.productDetails.condition.label')]: postData.condition === 'NEW' ? t('pages.productDetails.condition.new') : t('pages.productDetails.condition.used'),
          [t('pages.productDetails.city')]: postData.cityName || 'Riyadh',
          [t('pages.productDetails.publishDate')]: new Date(postData.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US'),
          [t('pages.productDetails.adNumber')]: postData.id,
          [t('pages.productDetails.views')]: postData.viewCount || 0,
        },
        seller: {
          id: postData.ownerId,
          name: postData.store?.nameEn || postData.ownerUsername || 'GamersStation',
          rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
          responseTime: currentLang === 'ar' ? '1 ساعة' : '1 hour',
          products: Math.floor(Math.random() * 200) + 50,
          verified: postData.store?.isVerified || false
        }
      };
      
      setProduct(transformedProduct);
      
      // Fetch related products from same category
      let transformedRelated = [];
      
      // First try to get products from the same category
      console.log('Fetching similar products for category ID:', postData.categoryId, 'Name:', postData.categoryName);
      if (postData.categoryId) {
        try {
          const relatedData = await postService.getPosts({
            categoryId: postData.categoryId,
            page: 0, // API uses 0-based pagination
            size: 8,
            sortBy: 'createdAt',
            direction: 'DESC'
          });
          
          console.log('Related products response:', relatedData);
          
          if (relatedData && relatedData.content) {
            transformedRelated = relatedData.content
              .filter(post => post.id !== postData.id)
              .map(post => ({
                id: post.id,
                name: post.localizedTitle?.[currentLang] || post.title || 'Untitled',
                price: post.price || 0,
                rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
                image: post.images?.[0]?.url || '/placeholder-game.jpg'
              }));
            console.log('Transformed related products:', transformedRelated);
          }
        } catch (err) {
          console.error('Error fetching category products:', err);
        }
      }
      
      // If we don't have enough related products, fetch random products
      if (transformedRelated.length < 4) {
        try {
          console.log('Fetching additional products, current count:', transformedRelated.length);
          const randomData = await postService.getPosts({
            page: 0, // API uses 0-based pagination
            size: 10,
            sortBy: 'createdAt',
            direction: 'DESC'
          });
          
          console.log('Random products response:', randomData);
          
          if (randomData && randomData.content) {
            const additionalProducts = randomData.content
              .filter(post => post.id !== postData.id && !transformedRelated.find(p => p.id === post.id))
              .map(post => ({
                id: post.id,
                name: post.localizedTitle?.[currentLang] || post.title || 'Untitled',
                price: post.price || 0,
                rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
                image: post.images?.[0]?.url || '/placeholder-game.jpg'
              }));
            
            transformedRelated = [...transformedRelated, ...additionalProducts].slice(0, 4);
            console.log('Final related products:', transformedRelated);
          }
        } catch (err) {
          console.error('Error fetching random products:', err);
        }
      } else {
        transformedRelated = transformedRelated.slice(0, 4);
      }
        
      setRelatedProducts(transformedRelated);
      
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = product.name;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert(t('pages.productDetails.linkCopied'));
        break;
    }
    setShowShareMenu(false);
  };

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  if (loading) {
    return (
      <div className="product-details-page gaming-theme">
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
      <div className="product-details-page gaming-theme">
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

  // Structured data
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
    }
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
      <div className="product-details-page gaming-theme">
        <Header />
        
        {/* Gaming Background Pattern */}
        <div className="gaming-bg-pattern"></div>
        
        <div className="container">
          {/* Breadcrumb */}
          <div className="gaming-breadcrumb">
            <a href="/">{t('pages.productDetails.home')}</a>
            <ChevronLeft className="breadcrumb-arrow" size={16} />
            <a href="#">{product.category}</a>
            <ChevronLeft className="breadcrumb-arrow" size={16} />
            <span className="current-page">{i18n.language === 'ar' ? product.arabicName : product.name}</span>
          </div>

          {/* Main Product Card */}
          <div className="product-main-card">
            <div className="card-glow"></div>
            
            {/* Product Gallery Section (Left Side) */}
            <div className="product-gallery-section">
              {/* Thumbnails sidebar - vertical strip */}
              <div className="thumbnails-sidebar">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail-button ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => handleImageSelect(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    {image.startsWith('http') ? (
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="thumbnail-img"
                      />
                    ) : (
                      <Gamepad2 size={30} />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Main image */}
              <div className="main-image-wrapper">
                <div className="image-badge">
                  <Gamepad2 size={20} />
                  <span>{product.category}</span>
                </div>
                
                <div className="main-product-image">
                  {product.images[selectedImage].startsWith('http') ? (
                    <OptimizedImage
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="product-img"
                      priority={true}
                      objectFit="contain"
                    />
                  ) : (
                    <div className="product-icon-wrapper">
                      <Gamepad2 size={120} className="product-icon" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info Section (Right Side) */}
            <div className="product-info-section">
              <div className="product-header-info">
                <h1 className="product-title">{product.name}</h1>
                {product.arabicName && product.arabicName !== product.name && (
                  <h2 className="product-arabic-title">{product.arabicName}</h2>
                )}
                <p className="product-brief">{product.description}</p>
              </div>

              {/* Price Display */}
              <div className="price-display">
                <div className="price-info">
                  <span className="currency-symbol">{t('currency')}</span>
                  <span className="price-amount">{product.price.toLocaleString()}</span>
                </div>
                {product.originalPrice > product.price && (
                  <div className="original-price">
                    <span>{product.originalPrice} {t('currency')}</span>
                    <span className="discount-badge">-{product.discount}%</span>
                  </div>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="quick-info-grid">
                <div className="info-item">
                  <Shield className="info-icon" />
                  <div>
                    <span className="info-label">{t('pages.productDetails.condition.label')}</span>
                    <span className="info-value">{product.specifications[t('pages.productDetails.condition.label')]}</span>
                  </div>
                </div>
                <div className="info-item">
                  <MapPin className="info-icon" />
                  <div>
                    <span className="info-label">{t('pages.productDetails.location')}</span>
                    <span className="info-value">{product.specifications[t('pages.productDetails.city')]}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Calendar className="info-icon" />
                  <div>
                    <span className="info-label">{t('pages.productDetails.posted')}</span>
                    <span className="info-value">{product.specifications[t('pages.productDetails.publishDate')]}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Package className="info-icon" />
                  <div>
                    <span className="info-label">{t('pages.productDetails.adNumber')}</span>
                    <span className="info-value">#{product.specifications[t('pages.productDetails.adNumber')]}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-section">
                <button
                  className="btn-contact-seller"
                  onClick={async () => {
                    if (!authService.isAuthenticated()) {
                      navigate('/login');
                      return;
                    }
                    
                    try {
                      const conversation = await messagingService.startConversation(
                        product.id,
                        t('chat.interestedInProduct', { productName: product.name }) || `Hi, I'm interested in ${product.name}`
                      );
                      navigate(`/chat/${conversation.id}`);
                    } catch (error) {
                      console.error('Error starting conversation:', error);
                      alert(t('chat.errorStartingConversation') || 'Could not start conversation. Please try again.');
                    }
                  }}
                >
                  <MessageCircle size={20} />
                  <span>{t('pages.productDetails.contactSeller')}</span>
                </button>

                <div className="secondary-actions">
                  <button
                    className={`btn-icon ${isWishlisted ? 'active' : ''}`}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    aria-label={t('pages.productDetails.addToWishlist')}
                  >
                    <Heart size={20} />
                  </button>
                  <div className="share-wrapper">
                    <button
                      className="btn-icon"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      aria-label={t('pages.productDetails.share')}
                    >
                      <Share2 size={20} />
                    </button>
                    {showShareMenu && (
                      <div className="share-menu">
                        <button onClick={() => handleShare('whatsapp')}>WhatsApp</button>
                        <button onClick={() => handleShare('facebook')}>Facebook</button>
                        <button onClick={() => handleShare('twitter')}>Twitter</button>
                        <button onClick={() => handleShare('copy')}>{t('pages.productDetails.copyLink')}</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="rating-section">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating) ? 'filled' : ''}
                    />
                  ))}
                </div>
                <span className="rating-text">{product.rating}</span>
                <span className="reviews-count">({product.reviews} {t('pages.productDetails.reviews')})</span>
              </div>

            </div>
          </div>

          {/* Similar Products Section - Always Show */}
          <div className="related-products">
            <h2 className="section-title">
              <Gamepad2 size={24} />
              {t('pages.productDetails.similarProducts')}
            </h2>
            <div className="related-grid">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((item) => (
                  <a
                    key={item.id}
                    href={`/product/${item.id}`}
                    className="related-card"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/product/${item.id}`);
                    }}
                  >
                    <div className="related-image">
                      {item.image.startsWith('http') ? (
                        <OptimizedImage
                          src={item.image}
                          alt={item.name}
                          className="related-img"
                          objectFit="cover"
                        />
                      ) : (
                        <Gamepad2 size={60} className="related-icon" />
                      )}
                    </div>
                    <div className="related-info">
                      <h3>{item.name}</h3>
                      <div className="related-price">{item.price} {t('currency')}</div>
                      <div className="related-rating">
                        <Star size={14} className="filled" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                // Placeholder cards when no products are available
                [...Array(4)].map((_, index) => (
                  <div key={`placeholder-${index}`} className="related-card">
                    <div className="related-image">
                      <Gamepad2 size={60} className="related-icon" />
                    </div>
                    <div className="related-info">
                      <h3>{t('common.loading')}</h3>
                      <div className="related-price">-- {t('currency')}</div>
                      <div className="related-rating">
                        <Star size={14} />
                        <span>--</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetailsPage;