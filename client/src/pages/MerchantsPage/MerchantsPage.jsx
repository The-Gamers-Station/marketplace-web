import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  CheckCircle,
  Sparkles,
  Activity,
  Zap,
  ShoppingBag,
  Heart,
  MessageCircle,
  Truck,
  DollarSign,
  BarChart3,
  Globe,
  Verified
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import './MerchantsPage.css';

const MerchantsPage = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('rating');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredMerchant, setHoveredMerchant] = useState(null);
  
  // Initialize animations played state based on session storage
  const [animationsPlayed] = useState(() => {
    const hasPlayedAnimations = sessionStorage.getItem('merchantsPageAnimationsPlayed');
    if (hasPlayedAnimations === 'true') {
      return true;
    } else {
      // Mark animations as played for next refresh
      sessionStorage.setItem('merchantsPageAnimationsPlayed', 'true');
      return false;
    }
  });

  // Scroll animation hook
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const parallaxElements = document.querySelectorAll('.parallax-element');
      parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sample merchants data with enhanced properties
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
      responseRate: '98%',
      trending: true,
      discount: 15,
      salesCount: '5K+',
      satisfaction: 96,
      tags: ['سرعة في التوصيل', 'خدمة ممتازة', 'أسعار منافسة'],
      color: 'gradient-purple'
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
      responseRate: '95%',
      trending: false,
      discount: 10,
      salesCount: '3K+',
      satisfaction: 92,
      tags: ['ضمان شامل', 'دعم فني'],
      color: 'gradient-blue'
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
      responseRate: '99%',
      trending: true,
      discount: 20,
      salesCount: '10K+',
      satisfaction: 98,
      tags: ['حصريات', 'أفضل الأسعار', 'منتجات أصلية'],
      color: 'gradient-orange'
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
      responseRate: '92%',
      trending: false,
      discount: 5,
      salesCount: '1K+',
      satisfaction: 90,
      tags: ['جودة عالية', 'أسعار مناسبة'],
      color: 'gradient-green'
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
      responseRate: '96%',
      trending: true,
      discount: 12,
      salesCount: '7K+',
      satisfaction: 94,
      tags: ['توصيل سريع', 'خدمة 24/7'],
      color: 'gradient-pink'
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
      responseRate: '90%',
      trending: false,
      discount: 8,
      salesCount: '2K+',
      satisfaction: 88,
      tags: ['تسليم فوري', 'دفع آمن'],
      color: 'gradient-cyan'
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
      case 'premium': return 'mp-badge-premium';
      case 'gold': return 'mp-badge-gold';
      case 'silver': return 'mp-badge-silver';
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
    <div className={`mp-merchants-page ${animationsPlayed ? 'mp-animations-played' : ''}`}>
      <SEO
        title={t('pages.merchants.title')}
        description={t('pages.merchants.discoverMerchants')}
        keywords="تجار, متاجر, GamersStation, ألعاب إلكترونية, بائعين موثوقين, متاجر ألعاب"
        url="https://gamersstation.eg/merchants"
      />
      <Header />

      {/* Enhanced Hero Section */}
      <section className="mp-merchants-hero">
        <div className="mp-hero-bg">
          <div className="mp-hero-gradient"></div>
          <div className="mp-hero-pattern"></div>
          <div className="mp-floating-shapes">
            <div className="mp-shape mp-shape-1" data-speed="0.2"></div>
            <div className="mp-shape mp-shape-2" data-speed="0.3"></div>
            <div className="mp-shape mp-shape-3" data-speed="0.4"></div>
          </div>
        </div>
        <div className="mp-container">
          <div className="mp-hero-content">
            <div className="mp-hero-badge">
              <Sparkles className="mp-badge-icon" />
              <span>{t('pages.merchants.trustedPlatform')}</span>
            </div>

            <h1 className="mp-hero-title">
              <span className="mp-title-gradient">{t('pages.merchants.title')}</span>
              <Store className="mp-title-icon mp-floating" />
              <span className="mp-title-highlight">GamersStation</span>
            </h1>

            <p className="mp-hero-subtitle">
              <Zap className="mp-subtitle-icon" />
              {t('pages.merchants.discoverMerchants')}
            </p>

            {/* Enhanced Stats with Animation */}
            <div className="mp-hero-stats">
              <div
                className="mp-stat-item mp-glass-card"
                style={animationsPlayed ? { animationDelay: '0s' } : { animationDelay: '0.1s' }}
              >
                <div className="mp-stat-icon">
                  <Verified />
                </div>
                <span className="mp-stat-number mp-counting" data-target="500">
                  500+
                </span>
                <span className="mp-stat-label">{t('pages.merchants.verifiedMerchants')}</span>
                <div className="mp-stat-progress"></div>
              </div>
              <div
                className="mp-stat-item mp-glass-card"
                style={animationsPlayed ? { animationDelay: '0s' } : { animationDelay: '0.2s' }}
              >
                <div className="mp-stat-icon">
                  <ShoppingBag />
                </div>
                <span className="mp-stat-number mp-counting" data-target="10000">
                  10K+
                </span>
                <span className="mp-stat-label">{t('pages.merchants.availableProducts')}</span>
                <div className="mp-stat-progress"></div>
              </div>
              <div
                className="mp-stat-item mp-glass-card"
                style={animationsPlayed ? { animationDelay: '0s' } : { animationDelay: '0.3s' }}
              >
                <div className="mp-stat-icon">
                  <Activity />
                </div>
                <span className="mp-stat-number mp-counting" data-target="50000">
                  50K+
                </span>
                <span className="mp-stat-label">{t('pages.merchants.successfulSales')}</span>
                <div className="mp-stat-progress"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Content */}
      <section className="mp-merchants-content">
        <div className="mp-container">
          <div className="mp-content-grid">
            {/* Sidebar Filters */}
            <aside className="mp-filters-sidebar">
              <div className="mp-filter-header">
                <Filter size={20} />
                <h2>تصفية النتائج</h2>
              </div>

              {/* Search */}
              <div className="mp-filter-section">
                <label className="mp-filter-label">{t('pages.merchants.search')}</label>
                <div className="mp-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder={t('pages.merchants.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mp-search-input"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mp-filter-section">
                <label className="mp-filter-label">{t('pages.merchants.categories')}</label>
                <div className="mp-filter-options">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      className={`mp-filter-option ${
                        selectedCategory === category.value ? "mp-active" : ""
                      }`}
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      <span>{category.label}</span>
                      <span className="mp-count">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mp-filter-section">
                <label className="mp-filter-label">{t('pages.merchants.sortBy')}</label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="mp-sort-select"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </aside>

            {/* Merchants Grid */}
            <main className="mp-merchants-grid">
              <div className="mp-results-header">
                <h2>{t('pages.merchants.availableMerchants')} ({sortedMerchants.length})</h2>
              </div>

              {sortedMerchants.map((merchant, index) => (
                <article
                  key={merchant.id}
                  className={`mp-merchant-card mp-glass-morph mp-${merchant.color} ${
                    hoveredMerchant === merchant.id ? "mp-hovered" : ""
                  }`}
                  onMouseEnter={() => setHoveredMerchant(merchant.id)}
                  onMouseLeave={() => setHoveredMerchant(null)}
                  style={animationsPlayed ? { animationDelay: '0s' } : { animationDelay: `${index * 0.1}s` }}
                >
                  {/* Badges Container */}
                  <div className="mp-badges-container">
                    {merchant.trending && (
                      <div className="mp-trending-badge">
                        <TrendingUp size={14} />
                        رائج
                      </div>
                    )}

                  </div>
                    {merchant.badge && (
                      <div className={`mp-merchant-badge mp-${getBadgeClass(merchant.badge)} mp-shimmer`}>
                        <Award size={16} />
                        <span>{getBadgeLabel(merchant.badge)}</span>
                      </div>
                    )}

                  <div className="mp-merchant-header">
                    <div className={`mp-merchant-logo mp-${merchant.color}`}>
                      <span className="mp-logo-emoji">{merchant.logo}</span>
                      {merchant.verified && (
                        <div className="mp-verified-badge mp-pulse">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                    <div className="mp-merchant-info">
                      <h3 className="mp-merchant-name">{merchant.name}</h3>
                      <div className="mp-merchant-meta">
                        <span className="mp-location">
                          <MapPin size={14} />
                          {merchant.location}
                        </span>
                        <span className="mp-join-date">
                          <Clock size={14} />
                          منذ {merchant.joinDate}
                        </span>
                      </div>

                      {/* New: Quick tags */}
                      <div className="mp-quick-tags">
                        {merchant.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="mp-quick-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Stats Section */}
                  <div className="mp-merchant-stats-grid">
                    <div className="mp-stat-card">
                      <Star className="mp-stat-icon mp-glow" />
                      <div className="mp-stat-content">
                        <span className="mp-stat-value">{merchant.rating}</span>
                        <span className="mp-stat-label">{t('pages.merchants.rating')}</span>
                      </div>
                      <div className="mp-stat-bar">
                        <div
                          className="mp-stat-fill"
                          style={{ width: `${merchant.rating * 20}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mp-stat-card">
                      <BarChart3 className="mp-stat-icon" />
                      <div className="mp-stat-content">
                        <span className="mp-stat-value">
                          {merchant.salesCount}
                        </span>
                        <span className="mp-stat-label">{t('pages.merchants.sales')}</span>
                      </div>
                      <div className="mp-stat-bar">
                        <div
                          className="mp-stat-fill"
                          style={{ width: `${merchant.satisfaction}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mp-stat-card">
                      <Activity className="mp-stat-icon mp-pulse" />
                      <div className="mp-stat-content">
                        <span className="mp-stat-value">
                          {merchant.satisfaction}%
                        </span>
                        <span className="mp-stat-label">{t('pages.merchants.customerSatisfaction')}</span>
                      </div>
                      <div className="mp-stat-bar">
                        <div
                          className="mp-stat-fill mp-success"
                          style={{ width: `${merchant.satisfaction}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mp-merchant-specialties">
                    <h3 className="mp-specialties-title">
                      <Sparkles size={14} />
                      {t('pages.merchants.specialties')}
                    </h3>
                    <div className="mp-specialty-tags">
                      {merchant.specialties.map((specialty, index) => (
                        <span key={index} className="mp-specialty-tag mp-glass">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mp-merchant-footer">
                    <div className="mp-footer-info">
                      <div className="mp-delivery-info">
                        <Truck size={16} className="mp-animated-icon" />
                        <span>{merchant.deliveryTime}</span>
                      </div>
                      <div className="mp-response-info">
                        <MessageCircle size={16} />
                        <span>{merchant.responseRate}</span>
                      </div>
                    </div>

                    <div className="mp-action-buttons">
                      <button className="mp-quick-view-btn mp-glass" aria-label={t('pages.merchants.quickView')}>
                        <Globe size={16} />
                      </button>
                      <button className="mp-view-store-btn mp-gradient-btn">
                        <span>{t('pages.merchants.viewStore')}</span>
                        <ChevronRight size={16} className="mp-arrow-icon" />
                        <div className="mp-btn-glow"></div>
                      </button>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="mp-card-overlay"></div>
                </article>
              ))}
            </main>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mp-merchant-cta">
        <div className="mp-container">
          <div className="mp-cta-content">
            <div className="mp-cta-text">
              <h2>{t('pages.merchants.joinUs')}</h2>
              <p>{t('pages.merchants.startSelling')}</p>
              <ul className="mp-benefits-list">
                <li>
                  <Shield size={20} />
                  <span>حماية كاملة للمعاملات</span>
                </li>
                <li>
                  <Users size={20} />
                  <span>{t('pages.merchants.accessToBuyers')}</span>
                </li>
                <li>
                  <TrendingUp size={20} />
                  <span>أدوات تحليل متقدمة</span>
                </li>
              </ul>
              <button className="mp-cta-button">
                {t('pages.merchants.registerNow')}
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="mp-cta-image">
              <div className="mp-image-placeholder">
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