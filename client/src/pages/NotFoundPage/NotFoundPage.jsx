import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Generate deterministic positions based on index
  const floatingShapes = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: ((i * 37) % 100), // Deterministic pseudo-random distribution
      top: ((i * 53) % 100),  // Using prime numbers for better distribution
      delay: i * 0.2,
      duration: 15 + i * 2,
      type: i % 4
    }));
  }, []);

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('notFound.title')} - GamersStation</title>
        <meta name="description" content={t('notFound.description')} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Header />
      
      <div className="not-found-page">
        <div className="not-found-background">
          {/* Animated background elements */}
          <div className="floating-shapes">
            {floatingShapes.map((shape) => (
              <div
                key={shape.id}
                className={`shape shape-${shape.type}`}
                style={{
                  '--delay': `${shape.delay}s`,
                  '--duration': `${shape.duration}s`,
                  left: `${shape.left}%`,
                  top: `${shape.top}%`,
                }}
              />
            ))}
          </div>
          
          {/* Glitch effect overlay */}
          <div className="glitch-overlay"></div>
        </div>

        <div className="not-found-content">
          <div className="error-container">
            {/* 404 with glitch effect */}
            <div className="error-code-wrapper">
              <h1 
                className="error-code"
                style={{
                  transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
                }}
              >
                <span className="glitch-text" data-text="404">404</span>
              </h1>
              <div className="error-shadow">404</div>
            </div>

            {/* Game controller icon */}
            <div className="controller-icon">
              <svg viewBox="0 0 640 512" className="game-controller">
                <path d="M480 96H160C71.6 96 0 167.6 0 256s71.6 160 160 160c44.8 0 85.2-18.4 114.2-48h91.5c29 29.6 69.5 48 114.2 48 88.4 0 160-71.6 160-160S568.4 96 480 96zM256 276c0 6.6-5.4 12-12 12h-52v52c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-52H76c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h52v-52c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h52c6.6 0 12 5.4 12 12v40zm184 68c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm80-80c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"/>
              </svg>
              <div className="controller-glow"></div>
            </div>

            {/* Error message */}
            <div className="error-message">
              <h2 className="error-title">{t('notFound.gameOver')}</h2>
              <p className="error-description">{t('notFound.message')}</p>
            </div>

            {/* Action buttons */}
            <div className="error-actions">
              <Link to="/" className="respawn-button">
                <span className="button-icon">🏠</span>
                <span className="button-text">{t('notFound.backToHome')}</span>
                <div className="button-glow"></div>
              </Link>
              
              <button 
                onClick={() => navigate(-1)} 
                className="retry-button"
              >
                <span className="button-icon">↩️</span>
                <span className="button-text">{t('notFound.goBack')}</span>
              </button>
            </div>

            {/* Auto redirect countdown */}
            <div className="redirect-notice">
              <div className="countdown-circle">
                <svg className="countdown-svg">
                  <circle
                    className="countdown-progress"
                    cx="20"
                    cy="20"
                    r="18"
                    style={{
                      strokeDashoffset: 113 - (113 * countdown) / 10,
                    }}
                  />
                </svg>
                <span className="countdown-number">{countdown}</span>
              </div>
              <p className="redirect-text">
                {t('notFound.redirecting', { seconds: countdown })}
              </p>
            </div>

            {/* Popular links */}
            <div className="popular-links">
              <h3>{t('notFound.popularPages')}</h3>
              <div className="links-grid">
                <Link to="/" className="popular-link">
                  <span className="link-icon">🎮</span>
                  <span>{t('navigation.home')}</span>
                </Link>
                <Link to="/faq" className="popular-link">
                  <span className="link-icon">❓</span>
                  <span>{t('navigation.faq')}</span>
                </Link>
                <Link to="/contact" className="popular-link">
                  <span className="link-icon">📧</span>
                  <span>{t('navigation.contact')}</span>
                </Link>
                <Link to="/login" className="popular-link">
                  <span className="link-icon">🔑</span>
                  <span>{t('navigation.login')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Easter egg game hint */}
        <div className="easter-egg-hint">
          <p>{t('notFound.easterEgg')}</p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default NotFoundPage;