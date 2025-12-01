import React, { useState, useEffect, useRef, memo } from 'react';
import './OptimizedImage.css';

const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  placeholder = '/placeholder-game.jpg',
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
  width,
  height,
  srcSet,
  sizes,
  priority = false,
  objectFit = 'cover',
  ...rest
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    // If priority image, load immediately
    if (priority || loading === 'eager') {
      loadImage();
      return;
    }

    // Setup Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      loadImage();
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, priority, loading]);

  const loadImage = () => {
    if (!src) return;

    const img = new Image();
    
    // Handle srcSet if provided
    if (srcSet) {
      img.srcset = srcSet;
    }
    
    // Handle sizes if provided
    if (sizes) {
      img.sizes = sizes;
    }

    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
      setError(false);
      if (onLoad) onLoad();
    };

    img.onerror = () => {
      setImageSrc(placeholder);
      setError(true);
      setImageLoaded(false);
      if (onError) onError();
    };

    img.src = src;
  };

  // Handle native image error (fallback)
  const handleError = () => {
    if (!error) {
      setImageSrc(placeholder);
      setError(true);
      setImageLoaded(false);
      if (onError) onError();
    }
  };

  // Handle native image load
  const handleLoad = () => {
    setImageLoaded(true);
    if (onLoad) onLoad();
  };

  // Generate responsive srcSet if not provided
  const generateSrcSet = () => {
    if (srcSet) return srcSet;
    if (!src || error) return undefined;
    
    // Basic responsive image generation
    const baseSrc = src.split('?')[0];
    const params = src.includes('?') ? src.split('?')[1] : '';
    
    if (src.includes('unsplash.com')) {
      return `
        ${baseSrc}?w=400${params ? '&' + params : ''} 400w,
        ${baseSrc}?w=800${params ? '&' + params : ''} 800w,
        ${baseSrc}?w=1200${params ? '&' + params : ''} 1200w
      `;
    }
    
    return undefined;
  };

  // Generate sizes attribute if not provided
  const generateSizes = () => {
    if (sizes) return sizes;
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  return (
    <div 
      className={`optimized-image-container ${className}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Blur placeholder while loading */}
      {!imageLoaded && !error && (
        <div 
          className="image-placeholder"
          style={{
            backgroundImage: `url(${placeholder})`,
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`optimized-image ${imageLoaded ? 'loaded' : ''} ${error ? 'error' : ''}`}
        loading={priority ? 'eager' : loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
        srcSet={generateSrcSet()}
        sizes={generateSizes()}
        style={{
          objectFit,
          opacity: imageLoaded ? 1 : 0
        }}
        {...rest}
      />

      {/* Loading skeleton */}
      {!imageLoaded && !error && (
        <div className="image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="image-error">
          <span className="error-icon">🖼️</span>
          <span className="error-text">Image unavailable</span>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;