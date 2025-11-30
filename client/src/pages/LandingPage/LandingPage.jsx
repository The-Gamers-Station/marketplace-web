import React from 'react';
import Header from '../../components/Header/Header';
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <CategoryFilter />
      <main className="main-content">
        <ProductGrid />
      </main>
    </div>
  );
};

export default LandingPage;