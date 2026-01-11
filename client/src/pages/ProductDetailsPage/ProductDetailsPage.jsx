import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
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
import userService from '../../services/userService';
import { getTranslatedCityName } from '../../utils/cityTranslations';
import { showError } from '../../components/ErrorNotification/ErrorNotification';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [postType, setPostType] = useState(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [sellerDetails, setSellerDetails] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [id, currentLang]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch product details
      const postData = await postService.getPostById(id);
      
      // Save post type
      setPostType(postData.type);
      
      // Transform Post data to Product format
      const transformedProduct = {
        id: postData.id,
        name: postData.localizedTitle?.[currentLang] || postData.title || 'Untitled Product',
        arabicName: postData.localizedTitle?.ar || postData.title || 'منتج بدون اسم',
        price: postData.price || 0,
        sold: Math.floor(Math.random() * 1000) + 100,
        availability: postData.status === 'ACTIVE' ? t('pages.productDetails.available') : t('pages.productDetails.unavailable'),
        brand: 'GamersStation',
        category: postData.categoryName || 'Gaming',
        categoryId: postData.categoryId,
        sku: `GS-${postData.id}-${new Date().getFullYear()}`,
        images: postData.images?.length > 0
          ? postData.images.map(img => img.url || '/placeholder-game.svg')
          : ['/placeholder-game.svg', '/placeholder-game.svg', '/placeholder-game.svg', '/placeholder-game.svg'], // Add multiple placeholders for testing
        description: postData.localizedDescription?.[currentLang] || postData.description || 'منتج عالي الجودة من GamersStation',
        type: postData.type, // Add type to product data
        specifications: {
          [t('pages.productDetails.condition.label')]: (() => {
            switch (postData.condition) {
              case 'NEW':
                return t('addProduct.conditions.new');
              case 'LIKE_NEW':
                return t('addProduct.conditions.likeNew');
              case 'USED_GOOD':
                return t('addProduct.conditions.good');
              case 'USED_FAIR':
                return t('addProduct.conditions.fair');
              default:
                return postData.condition === 'NEW' ? t('pages.productDetails.condition.new') : t('pages.productDetails.condition.used');
            }
          })(),
          [t('pages.productDetails.city')]: getTranslatedCityName(postData.cityName, t),
          [t('pages.productDetails.publishDate')]: new Date(postData.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US'),
          [t('pages.productDetails.adNumber')]: postData.id,
          [t('pages.productDetails.views')]: postData.viewCount || 0,
        },
        seller: {
          id: postData.ownerId,
          name: postData.store?.nameEn || postData.ownerUsername || (currentLang === 'ar' ? 'مجهول' : 'Anonymous'),
          verified: postData.store?.isVerified || false,
          city: getTranslatedCityName(postData.cityName, t)
        }
      };
      
      setProduct(transformedProduct);
      
      // Try to fetch seller details for avatar
      if (postData.ownerId) {
        try {
          const userData = await userService.getUserById(postData.ownerId);
          setSellerDetails({
            avatar: userData.profileImageUrl,
            storeName: userData.storeName,
            username: userData.username,
            name: userData.name || userData.username || (currentLang === 'ar' ? 'مجهول' : 'Anonymous'),
            city: getTranslatedCityName(userData.cityName || postData.cityName, t)
          });
        } catch {
          // Could not fetch seller details
        }
      }
      
      // Fetch related products from same category
      let transformedRelated = [];
      
      // First try to get products from the same category
      if (postData.categoryId) {
        try {
          const relatedData = await postService.getPosts({
            categoryId: postData.categoryId,
            page: 0, // API uses 0-based pagination
            size: 8,
            sortBy: 'createdAt',
            direction: 'DESC'
          });
          
          if (relatedData && relatedData.content) {
            transformedRelated = relatedData.content
              .filter(post => post.id !== postData.id)
              .map(post => ({
                id: post.id,
                name: post.localizedTitle?.[currentLang] || post.title || 'Untitled',
                price: post.price || 0,
                image: post.images?.[0]?.url || '/placeholder-game.svg'
              }));
          }
        } catch {
          // Error fetching category products
        }
      }
      
      // If we don't have enough related products, fetch random products
      if (transformedRelated.length < 4) {
        try {
          const randomData = await postService.getPosts({
            page: 0, // API uses 0-based pagination
            size: 10,
            sortBy: 'createdAt',
            direction: 'DESC'
          });
          
          if (randomData && randomData.content) {
            const additionalProducts = randomData.content
              .filter(post => post.id !== postData.id && !transformedRelated.find(p => p.id === post.id))
              .map(post => ({
                id: post.id,
                name: post.localizedTitle?.[currentLang] || post.title || 'Untitled',
                price: post.price || 0,
                image: post.images?.[0]?.url || '/placeholder-game.svg'
              }));
            
            transformedRelated = [...transformedRelated, ...additionalProducts].slice(0, 4);
          }
        } catch {
          // Error fetching random products
        }
      } else {
        transformedRelated = transformedRelated.slice(0, 4);
      }
        
      setRelatedProducts(transformedRelated);
      
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError(t('common.error'));
      showError(error);
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
        setShowCopyNotification(true);
        setTimeout(() => setShowCopyNotification(false), 3000);
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
                <div className={`image-badge type-badge ${postType === 'ASK' ? 'badge-ask' : 'badge-sell'}`}>
                  {postType === 'ASK' ? (
                    <>
                      <Package size={20} />
                      <span>{currentLang === 'ar' ? 'مطلوب' : 'Wanted'}</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>{currentLang === 'ar' ? 'للبيع' : 'For Sale'}</span>
                    </>
                  )}
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
  {/* </div> */}

              {/* Seller Information Card */}
              <div className="seller-info-card">
                <div className="seller-header">
                  <div className="seller-avatar">
                    {(sellerDetails?.avatar || product.seller.verified) ? (
                      sellerDetails?.avatar ? (
                        <OptimizedImage
                          src={sellerDetails.avatar}
                          alt={product.seller.name}
                          className="seller-avatar-img"
                          objectFit="cover"
                        />
                      ) : (
                        <User size={32} className="seller-avatar-icon" />
                      )
                    ) : (
                      <User size={32} className="seller-avatar-icon" />
                    )}
                    {product.seller.verified && (
                      <div className="verified-badge" title={t('pages.productDetails.verifiedSeller')}>
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                  <div className="seller-details">
                    <h3 className="seller-name">{sellerDetails?.name || product.seller.name}</h3>
                    <div className="seller-location">
                      <MapPin size={14} />
                      <span>{product.seller.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-section">
                {/* Show edit button if user is the owner */}
                {(() => {
                  const currentUser = authService.getCurrentUser();
                  const isOwner = currentUser && currentUser.userId === product.seller.id;
                  
                  if (isOwner) {
                    return (
                      <button
                        className="btn-contact-seller btn-edit-product"
                        onClick={() => navigate(`/edit-product/${product.id}`)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{t('common.edit')}</span>
                      </button>
                    );
                  }
                  
                  return null;
                })()}
                
                {/* Only show contact button if user is not the owner */}
                {(() => {
                  const currentUser = authService.getCurrentUser();
                  const isOwner = currentUser && currentUser.userId === product.seller.id;
                  return !isOwner;
                })() && (
                  <button
                    className="btn-contact-seller"
                    onClick={async () => {
                      // [ProductDetails] Contact seller clicked
                      
                      if (!authService.isAuthenticated()) {
                        // [ProductDetails] User not authenticated, redirecting to login
                        navigate('/login', {
                          state: { redirectTo: `/product/${product.id}` }
                        });
                        return;
                      }
                      
                      try {
                        // Check if conversation already exists for this product
                        const conversations = await messagingService.getConversations(0, 100);
                        const existingConversation = conversations?.content?.find(
                          conv => conv.post?.id === product.id
                        );
                        
                        if (existingConversation) {
                          // Navigate to existing conversation without sending a message
                          navigate(`/chat/${existingConversation.id}`);
                          return;
                        }
                        
                        // [ProductDetails] Starting conversation for product: product.id, product.name
                        
                        const initialMessage = t('chat.interestedInProduct', { productName: product.name }) || `Hi, I'm interested in ${product.name}`;
                        // [ProductDetails] Initial message: initialMessage
                        
                        const conversation = await messagingService.startConversation(
                          product.id,
                          initialMessage
                        );
                        
                        // [ProductDetails] Conversation response: conversation
                        
                        if (!conversation || !conversation.id) {
                          throw new Error('Invalid conversation response');
                        }
                        
                        navigate(`/chat/${conversation.id}`, {
                          state: {
                            initialMessage,
                            justCreated: true
                          }
                        });
                      } catch (error) {
                        // [ProductDetails] Error starting conversation: {
                        //   error,
                        //   message: error.message,
                        //   response: error.response,
                        //   productId: product.id
                        // }
                        
                        // Show more specific error messages
                        let errorMessage = t('chat.errorStartingConversation') || 'لا يمكن بدء المحادثة. يرجى المحاولة مرة أخرى';
                        
                        if (error.message.includes('[400]')) {
                          if (error.message.includes('yourself')) {
                            errorMessage = t('chat.cannotMessageYourself');
                          } else if (error.message.includes('inactive')) {
                            errorMessage = t('chat.productInactive') || 'Cannot start conversation on inactive product';
                          } else {
                            errorMessage = t('chat.invalidRequest') || 'Cannot start conversation. Please check the product details.';
                          }
                        } else if (error.message.includes('[401]') || error.message.includes('[403]')) {
                          errorMessage = t('chat.authenticationError') || 'Authentication error. Please login again.';
                          authService.clearTokens();
                          navigate('/login', {
                            state: { redirectTo: `/product/${product.id}` }
                          });
                          return;
                        } else if (error.message.includes('[404]')) {
                          errorMessage = t('chat.productNotFound') || 'Product not found.';
                        }
                        
                        showError({ messageAr: errorMessage, messageEn: errorMessage });
                      }
                    }}
                  >
                    <MessageCircle size={20} />
                    <span>{t('pages.productDetails.contactSeller')}</span>
                  </button>
                )}

                <div className="secondary-actions">
                  {/* <button
                    className={`btn-icon ${isWishlisted ? 'active' : ''}`}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    aria-label={t('pages.productDetails.addToWishlist')}
                  >
                    <Heart size={20} />
                  </button> */}
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
                         <button onClick={() => handleShare('copy')}>{t('pages.productDetails.copyLink')}</button>
                     </div>
                   )}
                 </div>
               </div>
             </div>

             {/* Copy Link Notification */}
             {showCopyNotification && (
               <div className="copy-notification">
                 <Check size={20} />
                 <span>{t('pages.productDetails.linkCopied')}</span>
               </div>
             )}

            </div>
          </div>


          {/* Similar Products Section - Modern Design */}
          <div className="related-products modern">
            <div className="section-header">
              <div className="section-title-wrapper">
                <div className="title-icon">
                  <Gamepad2 size={28} />
                </div>
                <h2 className="section-title">
                  {t('pages.productDetails.similarProducts')}
                </h2>
              </div>
              <div className="section-line"></div>
            </div>
            
            <div className="related-grid modern-grid">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((item, index) => (
                  <div
                    key={item.id}
                    className="related-card modern-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="card-glow-effect"></div>
                    
                    {/* Image Section */}
                    <div className="related-image-wrapper">
                      <div className="image-overlay"></div>
                      {item.image.startsWith('http') ? (
                        <OptimizedImage
                          src={item.image}
                          alt={item.name}
                          className="related-img"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="placeholder-image">
                          <Gamepad2 size={80} className="related-icon" />
                        </div>
                      )}
                      
                      {/* Quick View Button */}
                      <button
                        className="quick-view-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/product/${item.id}`);
                        }}
                        aria-label={t('pages.productDetails.viewProduct')}
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                    
                    {/* Info Section */}
                    <div className="related-content">
                      <h3 className="related-title">{item.name}</h3>
                      
                      <div className="price-section">
                        <div className="price-wrapper">
                          <span className="currency-prefix">{t('currency')}</span>
                          <span className="price-value">{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <button
                        className="view-product-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/product/${item.id}`);
                        }}
                      >
                        <span>{t('pages.productDetails.viewDetails') || 'View Details'}</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // Modern Skeleton Loaders
                [...Array(4)].map((_, index) => (
                  <div key={`skeleton-${index}`} className="related-card modern-card skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="related-content">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-price"></div>
                      <div className="skeleton-button"></div>
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