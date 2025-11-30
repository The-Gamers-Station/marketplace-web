import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductGrid.css';

const ProductGrid = () => {
  // Sample data matching the design with real gaming images
  const products = [
    {
      id: 1,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: '000.0',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop&auto=format',
      platforms: ['XBOX Series', 'PlayStation 5', 'Steam'],
      badge: 'عالسوم'
    },
    {
      id: 2,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: '000.0',
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop&auto=format',
      platforms: ['PlayStation 5', 'PC'],
      isHighlighted: true
    },
    {
      id: 3,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: '000.0',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop&auto=format',
      platforms: ['XBOX Series', 'Steam', 'PlayStation 5']
    },
    {
      id: 4,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: '000.0',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop&auto=format',
      platforms: ['Steam', 'Epic Games']
    },
    {
      id: 5,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: '000.0',
      image: 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=400&h=300&fit=crop&auto=format',
      platforms: ['PlayStation 5', 'XBOX Series']
    },
    {
      id: 6,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: '000.0',
      image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop&auto=format',
      platforms: ['PC', 'Steam']
    },
    {
      id: 7,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: '000.0',
      image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=300&fit=crop&auto=format',
      platforms: ['PlayStation 5', 'XBOX Series', 'PC']
    },
    {
      id: 8,
      title: 'عنوان جدا جدا طويل في هذا المكان بخط عريض',
      description: 'عنوان جدا جدا طويل في هذا المكان بخط شبه عنوان جدا جدا طويل في هذا المكان بخط وشبه',
      price: '000.0',
      image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400&h=300&fit=crop&auto=format',
      platforms: ['Steam', 'Epic Games', 'PC']
    }
  ];

  return (
    <div className="product-grid">
      <div className="grid-container">
        {products.map(product => (
          <ProductCard
            key={product.id}
            title={product.title}
            description={product.description}
            price={product.price}
            image={product.image}
            platforms={product.platforms}
            isHighlighted={product.isHighlighted}
            badge={product.badge}
          />
        ))}
      </div>
      
      <div className="load-more">
        <button className="load-more-btn">
          تحميل المزيد
          <span className="arrow-down">▼</span>
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;