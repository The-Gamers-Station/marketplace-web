import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ChevronDown, ArrowUpDown, Check } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';
import postService from '../../services/postService';
import { SkeletonLoader } from '../Loading/Loading';
import LocationFilter from '../LocationFilter/LocationFilter';
import './ProductGrid.css';

const ProductGrid = ({ categoryId, subcategoryType, searchQuery, regionId, cityId, minPrice, maxPrice, condition, sortBy: externalSortBy, direction: externalDirection, postType, hideLoadMore = false, initialPage = 0, onPageChange }) => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Sort state
  const [sortBy, setSortBy] = useState(externalSortBy || 'refreshedAt');
  const [direction, setDirection] = useState(externalDirection || 'DESC');
  const [showSortModal, setShowSortModal] = useState(false);

  // Internal location filter state (used when no regionId/cityId props are passed)
  const [internalRegionId, setInternalRegionId] = useState(null);
  const [internalCityId, setInternalCityId] = useState(null);

  const handleInternalLocationChange = ({ regionId: rId, cityId: cId }) => {
    setInternalRegionId(rId || null);
    setInternalCityId(cId || null);
  };

  // Resolve: prop takes precedence over internal state
  const activeRegionId = regionId ?? internalRegionId;
  const activeCityId   = cityId   ?? internalCityId;

  // Fetch products from backend
  const fetchProducts = async (pageNumber = 0, append = false) => {
    // Stamp this request; if a newer one starts before this finishes, discard result
    const gen = ++fetchGenRef.current;

    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const params = {
        page: pageNumber,
        size: 10, // Reduced from 20 to 10 to show pagination with fewer products
        sortBy: sortBy || 'refreshedAt',
        direction: direction || 'DESC',
      };

      // Add filters if provided
      if (categoryId) {
        params.categoryId = categoryId;
      } else if (subcategoryType && Array.isArray(subcategoryType)) {
        // Handle multiple category IDs for cross-platform subcategory search
        params.categoryIds = subcategoryType.join(',');
      }
      if (activeRegionId) {
        params.regionId = activeRegionId;
      }
      if (activeCityId) {
        params.cityId = activeCityId;
      }
      if (minPrice) {
        params.minPrice = minPrice;
      }
      if (maxPrice) {
        params.maxPrice = maxPrice;
      }
      if (condition) {
        params.condition = condition;
      }
      if (postType) {
        params.type = postType;
      }

      // Use search endpoint if search query is provided
      const response = searchQuery
        ? await postService.searchPosts({ ...params, q: searchQuery })
        : await postService.getPosts(params);

      // Discard stale response — a newer fetch has already started
      if (gen !== fetchGenRef.current) return;

      const transformedProducts = postService.transformPosts(response.content || []);
      
      if (append) {
        setProducts(prev => [...prev, ...transformedProducts]);
      } else {
        setProducts(transformedProducts);
        // Bump grid key so the stagger animation replays for the new result set
        setGridKey(k => k + 1);
      }

      setPage(pageNumber);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);

      // Notify parent immediately so URL stays in sync
      if (onPageChange) {
        onPageChange(pageNumber);
      }
      
      // Debug logging
      // console.log('Pagination Debug:', {
      //   pageNumber,
      //   totalPages: response.totalPages,
      //   totalElements: response.totalElements,
      //   productCount: transformedProducts.length,
      //   hideLoadMore
      // });
    } catch (err) {
      if (gen !== fetchGenRef.current) return;
      console.error('Error fetching products:', err);
      setError(err.message || t('common.error'));
    } finally {
      if (gen !== fetchGenRef.current) return;
      setLoading(false);
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy, newDirection) => {
    setSortBy(newSortBy);
    setDirection(newDirection);
    setShowSortModal(false);
  };

  // Get current sort option label
  const getCurrentSortLabel = () => {
    if ((sortBy === 'refreshedAt' || sortBy === 'createdAt') && direction === 'DESC') return t('allProducts.sortNewest');
    if ((sortBy === 'refreshedAt' || sortBy === 'createdAt') && direction === 'ASC') return t('allProducts.sortOldest');
    if (sortBy === 'price' && direction === 'ASC') return t('allProducts.sortPriceLow');
    if (sortBy === 'price' && direction === 'DESC') return t('allProducts.sortPriceHigh');
    return t('allProducts.sortNewest');
  };

  // Generation counter — each new fetch increments this; stale responses are discarded
  const fetchGenRef = useRef(0);
  // Key to force grid-container remount so stagger animation replays on new results
  const [gridKey, setGridKey] = useState(0);

  // Track whether this is the initial mount
  const isFirstRender = useRef(true);

  // Fetch products on mount and when filters change
  useEffect(() => {
    if (isFirstRender.current) {
      // On first render, use the page from URL (initialPage)
      isFirstRender.current = false;
      fetchProducts(initialPage, false);
    } else {
      // On filter changes, always reset to page 0
      fetchProducts(0, false);
    }
  }, [categoryId, subcategoryType, searchQuery, activeRegionId, activeCityId, minPrice, maxPrice, condition, sortBy, direction, postType]);



  // Single return keeps LocationFilter always mounted so its selection is never lost
  return (
    <div className="product-grid">

      {/* Section Header with Location Filter — always rendered */}
      <div className="grid-section-header">
        <h2 className="grid-section-title">{t('common.products', 'المنتجات')}</h2>

        {/* Location Filter - replaces sort button */}
        {!regionId && !cityId && (
          <LocationFilter onFilterChange={handleInternalLocationChange} />
        )}

        {/* Sort Button - commented out, replaced by location filter
        <button
          className="sort-mobile-btn mobile-sort"
          onClick={() => setShowSortModal(true)}
        >
          <ArrowUpDown size={16} />
          <span>{getCurrentSortLabel()}</span>
        </button>
        */}
      </div>

      {/* Mobile Sort Modal - commented out
      {showSortModal && ( ... )}
      */}

      {/* Loading state */}
      {loading && <SkeletonLoader type="card" count={6} />}

      {/* Error state */}
      {!loading && error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => fetchProducts(0, false)} className="retry-button">
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
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
      )}

      {/* Products grid — key changes on every new result set, replaying stagger animation */}
      {!loading && !error && products.length > 0 && (
        <div className="grid-container" key={gridKey}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              title={product.title}
              price={product.price}
              image={product.image}
              thumbnailUrl={product.thumbnailUrl}
              isHighlighted={product.isNew}
              badge={product.onSale ? (i18n.language === 'ar' ? 'عرض' : 'Sale') : null}
              username={product.ownerUsername}
              location={product.cityName}
              originalPrice={product.originalPrice}
              condition={product.condition}
              type={product.type}
              status={product.status}
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {!hideLoadMore && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>{t('pagination.showing')} {page * 10 + 1} - {Math.min((page + 1) * 10, totalElements)} {t('pagination.of')} {totalElements} {t('pagination.products')}</span>
          </div>
          
          <div className="pagination-controls">
            <button
              className="pagination-btn prev"
              onClick={() => fetchProducts(page - 1, false)}
              disabled={page === 0}
              aria-label={t('common.previous')}
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="page-numbers">
              {/* First page */}
              {totalPages > 5 && page > 2 && (
                <>
                  <button
                    className="page-number"
                    onClick={() => fetchProducts(0, false)}
                  >
                    1
                  </button>
                  {page > 3 && <span className="page-dots">...</span>}
                </>
              )}
              
              {/* Pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                if (pageNum >= 0 && pageNum < totalPages) {
                  return (
                    <button
                      key={pageNum}
                      className={`page-number ${pageNum === page ? 'active' : ''}`}
                      onClick={() => pageNum !== page && fetchProducts(pageNum, false)}
                    >
                      {pageNum + 1}
                    </button>
                  );
                }
                return null;
              })}
              
              {/* Last page */}
              {totalPages > 5 && page < totalPages - 3 && (
                <>
                  {page < totalPages - 4 && <span className="page-dots">...</span>}
                  <button
                    className="page-number"
                    onClick={() => fetchProducts(totalPages - 1, false)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              className="pagination-btn next"
              onClick={() => fetchProducts(page + 1, false)}
              disabled={page >= totalPages - 1 || totalPages === 0}
              aria-label={t('common.next')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;