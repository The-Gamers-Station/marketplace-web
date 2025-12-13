import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  ShoppingCart,
  Zap,
  Trophy,
  Star,
  ArrowRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Hero.css';

const Hero = () => {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Add a small delay to ensure DOM is ready and avoid initial flicker
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="hero">
      {/* Animated Background */}
      <div className="hero-background">
        <div className="hero-gradient"></div>
        <div className="hero-grid"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="hero-container">
        <div className="hero-content">
          {/* Badges */}
          <div className={`hero-badges ${isVisible ? 'animate-in' : ''}`}>
            <span className="badge badge-new">
              <Sparkles size={14} />
              {t('productCard.new')}
            </span>
            <span className="badge badge-hot">
              <Zap size={14} />
              {i18n.language === 'ar' ? 'عروض حصرية' : 'Exclusive Offers'}
            </span>
            <span className="badge badge-trending">
              <Trophy size={14} />
              {i18n.language === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers'}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className={`hero-title ${isVisible ? 'animate-in' : ''}`}>
            <span className="title-line">
              <span className="gradient-text">
                {t('hero.platform')}
              </span>
            </span>
            <span className="title-line">
              {t('hero.forGames')}
              <span className="highlight">
                {t('hero.products')}
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`hero-subtitle ${isVisible ? 'animate-in' : ''}`}>
            {i18n.language === 'ar'
              ? 'اكتشف عالماً من الألعاب الحصرية والعروض المذهلة'
              : 'Discover a world of exclusive games and amazing offers'}
            <br />
            {i18n.language === 'ar'
              ? 'مع ضمان أفضل الأسعار وخدمة عملاء متميزة'
              : 'with guaranteed best prices and exceptional customer service'}
          </p>

          {/* Stats */}
          <div className={`hero-stats ${isVisible ? 'animate-in' : ''}`}>
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">{t('hero.productsCount')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">{t('hero.trustedMerchants')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">{t('hero.happyCustomers')}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={`hero-actions ${isVisible ? 'animate-in' : ''}`}>
            <Link to="/products" className="btn-primary">
              <ShoppingCart size={20} />
              <span>{i18n.language === 'ar' ? 'تسوق الآن' : 'Shop Now'}</span>
              <ArrowRight size={18} className="arrow-icon" />
            </Link>
            <Link to="/contact" className="btn-secondary">
              <PhoneCall size={20} />
              <span>{i18n.language === 'ar' ? 'تواصل معنا' : 'Contact Us'}</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className={`trust-badges ${isVisible ? 'animate-in' : ''}`}>
            <div className="trust-item">
              <Star size={16} />
              <span>{i18n.language === 'ar' ? 'تقييم 4.9/5' : '4.9/5 Rating'}</span>
            </div>
            <div className="trust-item">
              <span>🔒</span>
              <span>{i18n.language === 'ar' ? 'دفع آمن 100%' : '100% Secure Payment'}</span>
            </div>
            <div className="trust-item">
              <span>🚚</span>
              <span>{i18n.language === 'ar' ? 'شحن سريع' : 'Fast Shipping'}</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">
          <div 
            className={`hero-image-wrapper ${isVisible ? 'animate-in' : ''}`}
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
            }}
          >
            {/* Gaming Controller Illustration */}
            <div className="gaming-visual">
              <div className="controller-glow"></div>
              <Gamepad2 className="controller-icon" size={200} />
              <div className="floating-cards">
                <div className="game-card card-1">
                  <div className="card-shine"></div>
                  <span>FIFA 24</span>
                </div>
                <div className="game-card card-2">
                  <div className="card-shine"></div>
                  <span>Call of Duty</span>
                </div>
                <div className="game-card card-3">
                  <div className="card-shine"></div>
                  <span>GTA VI</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="hero-decoration">
              <div className="orbit orbit-1"></div>
              <div className="orbit orbit-2"></div>
              <div className="orbit orbit-3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <span>{i18n.language === 'ar' ? 'اسحب لأسفل' : 'Scroll Down'}</span>
      </div>
    </section>
  );
};

export default Hero;