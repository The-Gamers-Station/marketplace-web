import React, { useState } from 'react';
import { 
  Store, 
  Star, 
  MapPin, 
  Package, 
  Shield, 
  Clock,
  Filter,
  Search,
  ChevronRight,
  Award,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './MerchantsPage.css';

const MerchantsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('rating');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample merchants data
  const merchants = [
    {
      id: 1,
      name: 'متجر الألعاب المتميز',
      logo: '🎮',
      rating: 4.8,
      reviews: 245,
      products: 156,
      joinDate: '2023',
      location: 'الرياض',
      verified: true,
      badge: 'premium',
      specialties: ['PlayStation', 'Xbox', 'Nintendo'],
      deliveryTime: '1-2 أيام',
      responseRate: '98%'
    },
    {
      id: 2,
      name: 'عالم البي سي',
      logo: '💻',
      rating: 4.6,
      reviews: 189,
      products: 98,
      joinDate: '2022',
      location: 'جدة',
      verified: true,
      badge: 'gold',
      specialties: ['أجهزة الكمبيوتر', 'ملحقات الألعاب', 'كروت الشاشة'],
      deliveryTime: '2-3 أيام',
      responseRate: '95%'
    },
    {
      id: 3,
      name: 'متجر القيمرز',
      logo: '🎯',
      rating: 4.9,
      reviews: 412,
      products: 234,
      joinDate: '2021',
      location: 'الدمام',
      verified: true,
      badge: 'premium',
      specialties: ['ألعاب نادرة', 'إصدارات محدودة', 'مقتنيات'],
      deliveryTime: '1-3 أيام',
      responseRate: '99%'
    },
    {
      id: 4,
      name: 'تك زون',
      logo: '🚀',
      rating: 4.5,
      reviews: 134,
      products: 67,
      joinDate: '2024',
      location: 'المدينة المنورة',
      verified: true,
      badge: 'silver',
      specialties: ['إكسسوارات', 'سماعات', 'أذرع تحكم'],
      deliveryTime: '2-4 أيام',
      responseRate: '92%'
    },
    {
      id: 5,
      name: 'ألعاب الشرق',
      logo: '⚡',
      rating: 4.7,
      reviews: 298,
      products: 145,
      joinDate: '2022',
      location: 'مكة',
      verified: true,
      badge: 'gold',
      specialties: ['PlayStation 5', 'ألعاب حصرية', 'بطاقات شحن'],
      deliveryTime: '1-2 أيام',
      responseRate: '96%'
    },
    {
      id: 6,
      name: 'ديجيتال ستور',
      logo: '🎪',
      rating: 4.4,
      reviews: 89,
      products: 56,
      joinDate: '2023',
      location: 'الطائف',
      verified: false,
      badge: 'silver',
      specialties: ['ألعاب رقمية', 'اشتراكات', 'رصيد المحافظ'],
      deliveryTime: 'فوري',
      responseRate: '90%'
    }
  ];

  const categories = [
    { value: 'all', label: 'جميع التجار', count: merchants.length },
    { value: 'premium', label: 'تجار مميزون', count: 3 },
    { value: 'consoles', label: 'أجهزة الألعاب', count: 4 },
    { value: 'pc', label: 'ألعاب الكمبيوتر', count: 2 },
    { value: 'accessories', label: 'إكسسوارات', count: 3 },
    { value: 'digital', label: 'منتجات رقمية', count: 1 }
  ];

  const sortOptions = [
    { value: 'rating', label: 'الأعلى تقييماً' },
    { value: 'reviews', label: 'الأكثر مراجعات' },
    { value: 'products', label: 'الأكثر منتجات' },
    { value: 'newest', label: 'الأحدث' }
  ];

  const getBadgeClass = (badge) => {
    switch(badge) {
      case 'premium': return 'badge-premium';
      case 'gold': return 'badge-gold';
      case 'silver': return 'badge-silver';
      default: return '';
    }
  };

  const getBadgeLabel = (badge) => {
    switch(badge) {
      case 'premium': return 'تاجر مميز';
      case 'gold': return 'تاجر ذهبي';
      case 'silver': return 'تاجر فضي';
      default: return '';
    }
  };

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'premium' && merchant.badge === 'premium');
    return matchesSearch && matchesCategory;
  });

  const sortedMerchants = [...filteredMerchants].sort((a, b) => {
    switch(selectedSort) {
      case 'rating': return b.rating - a.rating;
      case 'reviews': return b.reviews - a.reviews;
      case 'products': return b.products - a.products;
      case 'newest': return parseInt(b.joinDate) - parseInt(a.joinDate);
      default: return 0;
    }
  });

  return (
    <div className="merchants-page">
      <Header />
      
      {/* Hero Section */}
      <section className="merchants-hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <Store className="title-icon" />
              تجار GamersStation
            </h1>
            <p className="hero-subtitle">
              اكتشف أفضل التجار الموثوقين لجميع احتياجات الألعاب
            </p>
            
            {/* Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">تاجر موثق</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">منتج متاح</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">عملية بيع ناجحة</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Content */}
      <section className="merchants-content">
        <div className="container">
          <div className="content-grid">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
              <div className="filter-header">
                <Filter size={20} />
                <h3>تصفية النتائج</h3>
              </div>

              {/* Search */}
              <div className="filter-section">
                <label className="filter-label">البحث</label>
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="ابحث عن تاجر..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="filter-section">
                <label className="filter-label">الفئات</label>
                <div className="filter-options">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      className={`filter-option ${selectedCategory === category.value ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      <span>{category.label}</span>
                      <span className="count">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="filter-section">
                <label className="filter-label">ترتيب حسب</label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="sort-select"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </aside>

            {/* Merchants Grid */}
            <main className="merchants-grid">
              <div className="results-header">
                <h2>التجار المتاحون ({sortedMerchants.length})</h2>
              </div>

              {sortedMerchants.map(merchant => (
                <article key={merchant.id} className="merchant-card">
                  <div className="merchant-header">
                    <div className="merchant-logo">
                      <span className="logo-emoji">{merchant.logo}</span>
                      {merchant.verified && (
                        <div className="verified-badge">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                    <div className="merchant-info">
                      <h3 className="merchant-name">{merchant.name}</h3>
                      <div className="merchant-meta">
                        <span className="location">
                          <MapPin size={14} />
                          {merchant.location}
                        </span>
                        <span className="join-date">
                          <Clock size={14} />
                          منذ {merchant.joinDate}
                        </span>
                      </div>
                    </div>
                    {merchant.badge && (
                      <div className={`merchant-badge ${getBadgeClass(merchant.badge)}`}>
                        <Award size={16} />
                        <span>{getBadgeLabel(merchant.badge)}</span>
                      </div>
                    )}
                  </div>

                  <div className="merchant-stats">
                    <div className="stat">
                      <Star className="stat-icon" />
                      <span className="stat-value">{merchant.rating}</span>
                      <span className="stat-label">({merchant.reviews} تقييم)</span>
                    </div>
                    <div className="stat">
                      <Package className="stat-icon" />
                      <span className="stat-value">{merchant.products}</span>
                      <span className="stat-label">منتج</span>
                    </div>
                    <div className="stat">
                      <TrendingUp className="stat-icon" />
                      <span className="stat-value">{merchant.responseRate}</span>
                      <span className="stat-label">معدل الاستجابة</span>
                    </div>
                  </div>

                  <div className="merchant-specialties">
                    <h4>التخصصات:</h4>
                    <div className="specialty-tags">
                      {merchant.specialties.map((specialty, index) => (
                        <span key={index} className="specialty-tag">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="merchant-footer">
                    <div className="delivery-info">
                      <Clock size={16} />
                      <span>التوصيل: {merchant.deliveryTime}</span>
                    </div>
                    <button className="view-store-btn">
                      عرض المتجر
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </main>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="merchant-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>هل أنت تاجر؟ انضم إلينا</h2>
              <p>ابدأ البيع على أكبر منصة للألعاب في المنطقة</p>
              <ul className="benefits-list">
                <li>
                  <Shield size={20} />
                  <span>حماية كاملة للمعاملات</span>
                </li>
                <li>
                  <Users size={20} />
                  <span>وصول لآلاف العملاء</span>
                </li>
                <li>
                  <TrendingUp size={20} />
                  <span>أدوات تحليل متقدمة</span>
                </li>
              </ul>
              <button className="cta-button">
                سجل كتاجر الآن
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="cta-image">
              <div className="image-placeholder">
                <Store size={120} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MerchantsPage;