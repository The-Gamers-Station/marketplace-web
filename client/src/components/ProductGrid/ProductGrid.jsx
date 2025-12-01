import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../ProductCard/ProductCard';
import './ProductGrid.css';

const ProductGrid = () => {
  const { t, i18n } = useTranslation();
  
  // Sample data matching the design with real gaming images
  const products = [
    {
      id: 1,
      title: i18n.language === 'ar'
        ? 'عنوان جدا جدا طويل في هذا المكان بخط عريض'
        : 'Very Long Title in This Place with Bold Font',
      description: i18n.language === 'ar'
        ? 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه'
        : 'Very long title in this place with semi-bold font and description',
      price: 149.99,
      originalPrice: 199.99,
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop&auto=format',
      platforms: ['XBOX Series', 'PlayStation 5', 'Steam'],
      badge: i18n.language === 'ar' ? 'عالسوم' : 'On Sale',
      username: i18n.language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed',
      location: i18n.language === 'ar' ? 'القاهرة' : 'Cairo',
      rating: 4.5,
      reviewCount: 128
    },
    {
      id: 2,
      title: i18n.language === 'ar'
        ? 'عنوان جدا جدا طويل في هذا المكان بخط عريض'
        : 'Very Long Title in This Place with Bold Font',
      description: i18n.language === 'ar'
        ? 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه'
        : 'Very long title in this place with semi-bold font and description',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop&auto=format',
      platforms: ['PlayStation 5', 'PC'],
      isHighlighted: true,
      username: i18n.language === 'ar' ? 'محمود سامي' : 'Mahmoud Sami',
      location: i18n.language === 'ar' ? 'الإسكندرية' : 'Alexandria',
      rating: 5.0,
      reviewCount: 256
    },
    {
      id: 3,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: 99.99,
      originalPrice: 149.99,
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop&auto=format',
      platforms: ['XBOX Series', 'Steam', 'PlayStation 5'],
      username: 'سارة أحمد',
      location: 'الجيزة',
      rating: 4.2,
      reviewCount: 89
    },
    {
      id: 4,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop&auto=format',
      platforms: ['Steam', 'Epic Games'],
      username: 'يوسف علي',
      location: 'طنطا',
      rating: 3.8,
      reviewCount: 45
    },
    {
      id: 5,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=400&h=300&fit=crop&auto=format',
      platforms: ['PlayStation 5', 'XBOX Series'],
      username: 'عمرو حسن',
      location: 'المنصورة',
      rating: 4.7,
      reviewCount: 167
    },
    {
      id: 6,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop&auto=format',
      platforms: ['PC', 'Steam'],
      username: 'مروة خالد',
      location: 'أسوان',
      rating: 4.0,
      reviewCount: 72
    },
    {
      id: 7,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: 299.99,
      originalPrice: 399.99,
      image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=300&fit=crop&auto=format',
      platforms: ['PlayStation 5', 'XBOX Series', 'PC'],
      username: 'كريم سالم',
      location: 'الأقصر',
      rating: 4.9,
      reviewCount: 203
    },
    {
      id: 8,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: 179.99,
      image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400&h=300&fit=crop&auto=format',
      platforms: ['Steam', 'Epic Games', 'PC'],
      username: 'هاني عبدالله',
      location: 'دمياط',
      rating: 4.3,
      reviewCount: 94
    }
  ];

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
            platforms={product.platforms}
            isHighlighted={product.isHighlighted}
            badge={product.badge}
            username={product.username}
            location={product.location}
            rating={product.rating}
            reviewCount={product.reviewCount}
            originalPrice={product.originalPrice}
          />
        ))}
      </div>
      
      <div className="load-more">
        <button className="load-more-btn">
          {i18n.language === 'ar' ? 'تحميل المزيد' : 'Load More'}
          <span className="arrow-down">▼</span>
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;