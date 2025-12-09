import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../ProductCard/ProductCard';
import postService from '../../services/postService';
import './ProductGrid.css';

const ProductGrid = ({ categoryId, searchQuery }) => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch products from backend
  const fetchProducts = async (pageNumber = 0, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = {
        page: pageNumber,
        size: 20,
        sortBy: 'createdAt',
        direction: 'DESC',
      };

      // Add category filter if provided
      if (categoryId) {
        params.categoryId = categoryId;
      }

      // Use search endpoint if search query is provided
      const response = searchQuery 
        ? await postService.searchPosts({ ...params, q: searchQuery })
        : await postService.getPosts(params);

      const transformedProducts = postService.transformPosts(response.content || []);
      
      if (append) {
        setProducts(prev => [...prev, ...transformedProducts]);
      } else {
        setProducts(transformedProducts);
      }

      setHasMore(!response.last);
      setPage(pageNumber);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts(0, false);
  }, [categoryId, searchQuery]);

  // Load more products
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1, true);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-grid">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-grid">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => fetchProducts(0, false)} className="retry-button">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="product-grid">
        <div className="empty-state">
          <svg className="empty-icon" width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2L3 9H8V22H10V9H15L9 2Z" fill="currentColor" opacity="0.3"/>
            <path d="M15 22L21 15H16V2H14V15H9L15 22Z" fill="currentColor" opacity="0.3"/>
          </svg>
          <h3>{t('common.noResults')}</h3>
          <p>{searchQuery 
            ? t('productGrid.noSearchResults', { query: searchQuery })
            : t('productGrid.noProducts')
          }</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      <div className="grid-container">
        {products.map(product => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            description={product.description}
            price={product.price}
            image={product.image}
            platforms={product.category ? [product.category] : []}
            isHighlighted={product.isNew}
            badge={product.onSale ? (i18n.language === 'ar' ? 'عرض' : 'Sale') : null}
            username={product.ownerUsername}
            location={product.cityName}
            rating={product.rating}
            reviewCount={product.reviews}
            originalPrice={product.originalPrice}
            condition={product.condition}
            type={product.type}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="load-more">
          <button 
            className={`load-more-btn ${loadingMore ? 'loading' : ''}`}
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="loading-spinner-small"></span>
                {i18n.language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </>
            ) : (
              <>
                {i18n.language === 'ar' ? 'تحميل المزيد' : 'Load More'}
                <span className="arrow-down">▼</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;