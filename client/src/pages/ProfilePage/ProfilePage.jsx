
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  User,
  Edit3,
  Package,
  Heart,
  Star,
  Settings,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Camera,
  Save,
  X,
  Upload,
  Eye,
  MessageSquare,
  Award,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Globe,
  Link
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { PageLoader } from '../../components/Loading/Loading';
import MessagesTab from '../../components/MessagesTab/MessagesTab';
import authService from '../../services/authService';
import userService from '../../services/userService';
import postService from '../../services/postService';
import messagingService from '../../services/messagingService';
import './ProfilePage.css';

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    github: '',
    website: ''
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    rating: 0,
    joinDate: null
  });
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return false;
      }
      return true;
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user profile
        const userProfile = await userService.getCurrentUserProfile();
        setUser(userProfile);
        setEditedUser(userProfile);
        
        // Set social links if they exist
        if (userProfile.socialLinks) {
          setSocialLinks(userProfile.socialLinks);
        }
        
        // Get user posts
        let fetchedPosts = [];
        try {
          const posts = await postService.getMyPosts({ size: 20 });
          fetchedPosts = posts.content || [];
          setUserPosts(fetchedPosts);
        } catch (error) {
          console.error('Error fetching user posts:', error);
          setUserPosts([]);
        }
        
        // Calculate stats
        const totalViews = fetchedPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalLikes = fetchedPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
        
        setStats({
          totalPosts: fetchedPosts.length,
          totalViews,
          totalLikes,
          rating: userProfile.rating || 4.5,
          joinDate: userProfile.createdAt
        });
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      fetchUserData();
    }
  }, []);

  // Handle tab parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['posts', 'reviews', 'messages', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
    setSocialLinks(user.socialLinks || {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
      github: '',
      website: ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
    setImagePreview(null);
    setBackgroundPreview(null);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Prepare updated user data
      const updateData = {};
      
      // Only include fields that have changed
      if (editedUser.username && editedUser.username !== user.username) {
        updateData.username = editedUser.username;
      }
      
      if (editedUser.email !== user.email) {
        updateData.email = editedUser.email || null;
      }
      
      // Include cityId only if user doesn't have one yet (for profile completion)
      if (!user.cityId && editedUser.cityId) {
        updateData.cityId = editedUser.cityId;
      }
      
      // If there's a new profile image, add it to the update data
      if (imagePreview) {
        updateData.profileImage = imagePreview;
      }
      
      // If there's a new background image, add it to the update data
      if (backgroundPreview) {
        updateData.backgroundImage = backgroundPreview;
      }
      
      // Add individual social links to update data
      updateData.facebookLink = socialLinks.facebook || null;
      updateData.twitterLink = socialLinks.twitter || null;
      updateData.instagramLink = socialLinks.instagram || null;
      updateData.youtubeLink = socialLinks.youtube || null;
      updateData.linkedinLink = socialLinks.linkedin || null;
      updateData.githubLink = socialLinks.github || null;
      updateData.websiteLink = socialLinks.website || null;
      
      // Update user profile
      const updatedUser = await userService.updateProfile(updateData);
      
      // Update local state with the response
      setUser(updatedUser);
      setEditedUser(updatedUser);
      
      // Update social links from response
      if (updatedUser.socialLinks) {
        setSocialLinks(updatedUser.socialLinks);
      }
      
      setIsEditing(false);
      setImagePreview(null);
      setBackgroundPreview(null);
      
      // Show success message
      alert(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle social link changes
  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle background image upload
  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <PageLoader message={t('common.loading')} />;
  }

  // If no user data, show error
  if (!user) {
    return (
      <>
        <Header />
        <main className="profile-page">
          <div className="profile-container">
            <div className="empty-state" style={{ marginTop: '100px' }}>
              <User size={48} />
              <p>{t('profile.notLoggedIn') || 'Please log in to view your profile'}</p>
              <button
                className="add-post-btn"
                onClick={() => navigate('/login')}
              >
                {t('header.login')}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('profile.pageTitle')} - GamersStation</title>
        <meta name="description" content={t('profile.pageDescription')} />
      </Helmet>
      
      <Header />
      
      <main className="profile-page">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div
              className="profile-cover"
              style={{
                backgroundImage: backgroundPreview
                  ? `url(${backgroundPreview})`
                  : user?.backgroundImage
                  ? `url(${user.backgroundImage})`
                  : 'none'
              }}
            >
              <div className="profile-cover-gradient" />
              {isEditing && (
                <label className="cover-upload-btn">
                  <Upload size={20} />
                  <span>{t('profile.changeCover')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundChange}
                    hidden
                  />
                </label>
              )}
            </div>
            
            <div className="profile-info-section">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {isEditing ? (
                    <>
                      <img
                        src={imagePreview || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=ff6b35&color=fff&size=150`}
                        alt={user?.username || t('profile.userAvatar')}
                      />
                      <label className="avatar-upload-btn" title={t('profile.changeAvatar')}>
                        <Camera size={20} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          hidden
                        />
                      </label>
                    </>
                  ) : (
                    <img
                      src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=ff6b35&color=fff&size=150`}
                      alt={user?.username || t('profile.userAvatar')}
                    />
                  )}
                </div>
                {user?.verified && (
                  <div className="verified-badge">
                    <Shield size={16} />
                  </div>
                )}
              </div>
              
              <div className="profile-details">
                {isEditing ? (
                  <div className="edit-profile-form">
                    <input
                      type="text"
                      className="edit-input username-input"
                      value={editedUser.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder={t('profile.username')}
                    />
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSaveProfile}>
                        <Save size={16} />
                        {t('profile.save')}
                      </button>
                      <button className="cancel-btn" onClick={handleCancelEdit}>
                        <X size={16} />
                        {t('profile.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="profile-username">{user?.username || t('profile.anonymous')}</h1>
                    <div className="profile-meta">
                      <span className="meta-item">
                        <MapPin size={16} />
                        {user?.city || t('profile.noLocation')}
                      </span>
                      <span className="meta-item">
                        <Calendar size={16} />
                        {t('profile.memberSince')} {formatDate(stats.joinDate)}
                      </span>
                    </div>
                    <button className="edit-profile-btn" onClick={handleEdit}>
                      <Edit3 size={16} />
                      {t('profile.editProfile')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Links Section */}
          <div className="social-media-section">
            <div className="social-media-card">
              <div className="social-media-header">
                <h3>
                  <Link size={20} />
                  {t('profile.socialMedia') || 'Social Media Links'}
                </h3>
                {!isEditing && user?.socialLinks && Object.values(user.socialLinks).some(link => link) && (
                  <button className="edit-social-btn" onClick={handleEdit}>
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
              
              <div className="social-media-links">
                {isEditing ? (
                  <div className="social-links-edit">
                    <div className="social-link-input">
                      <Facebook size={20} />
                      <input
                        type="url"
                        placeholder={t('profile.facebookPlaceholder') || 'Facebook profile URL'}
                        value={socialLinks.facebook || ''}
                        onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                      />
                    </div>
                    
                    <div className="social-link-input">
                      <Twitter size={20} />
                      <input
                        type="url"
                        placeholder={t('profile.twitterPlaceholder') || 'Twitter profile URL'}
                        value={socialLinks.twitter || ''}
                        onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      />
                    </div>
                    
                    <div className="social-link-input">
                      <Instagram size={20} />
                      <input
                        type="url"
                        placeholder={t('profile.instagramPlaceholder') || 'Instagram profile URL'}
                        value={socialLinks.instagram || ''}
                        onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      />
                    </div>
                    
                    <div className="social-link-input">
                      <Youtube size={20} />
                      <input
                        type="url"
                        placeholder={t('profile.youtubePlaceholder') || 'YouTube channel URL'}
                        value={socialLinks.youtube || ''}
                        onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                      />
                    </div>
                    
                    <div className="social-link-input">
                      <Linkedin size={20} />
                      <input
                        type="url"
                        placeholder={t('profile.linkedinPlaceholder') || 'LinkedIn profile URL'}
                        value={socialLinks.linkedin || ''}
                        onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      />
                    </div>
                    
                    <div className="social-link-input">
                      <Github size={20} />
                      <input
                        type="url"
                        placeholder={t('profile.githubPlaceholder') || 'GitHub profile URL'}
                        value={socialLinks.github || ''}
                        onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                      />
                    </div>
                    
                    <div className="social-link-input">
                      <Globe size={20} />
                      <input
                        type="url"
                        placeholder={t('profile.websitePlaceholder') || 'Personal website URL'}
                        value={socialLinks.website || ''}
                        onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="social-links-display">
                    {user?.socialLinks?.facebook && (
                      <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Facebook size={20} />
                      </a>
                    )}
                    {user?.socialLinks?.twitter && (
                      <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Twitter size={20} />
                      </a>
                    )}
                    {user?.socialLinks?.instagram && (
                      <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Instagram size={20} />
                      </a>
                    )}
                    {user?.socialLinks?.youtube && (
                      <a href={user.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Youtube size={20} />
                      </a>
                    )}
                    {user?.socialLinks?.linkedin && (
                      <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Linkedin size={20} />
                      </a>
                    )}
                    {user?.socialLinks?.github && (
                      <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Github size={20} />
                      </a>
                    )}
                    {user?.socialLinks?.website && (
                      <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Globe size={20} />
                      </a>
                    )}
                    {(!user?.socialLinks || !Object.values(user.socialLinks).some(link => link)) && (
                      <div className="no-social-links">
                        <p>{t('profile.noSocialLinks') || 'No social media links added yet'}</p>
                        <button className="add-social-btn" onClick={handleEdit}>
                          <Link size={16} />
                          {t('profile.addSocialLinks') || 'Add Social Links'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Package size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalPosts}</span>
                <span className="stat-label">{t('profile.totalPosts')}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Eye size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalViews.toLocaleString()}</span>
                <span className="stat-label">{t('profile.totalViews')}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Heart size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalLikes}</span>
                <span className="stat-label">{t('profile.totalLikes')}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.rating.toFixed(1)}</span>
                <span className="stat-label">{t('profile.rating')}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <Package size={18} />
              {t('profile.myPosts')}
            </button>
            
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <MessageSquare size={18} />
              {t('profile.reviews')}
            </button>
            <button
              className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageSquare size={18} />
              {t('chat.messages')}
              {/* Show unread count if any */}
              <span className="unread-badge">3</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              {t('profile.settings')}
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-content">
            {activeTab === 'posts' && (
              <div className="posts-section">
                {userPosts.length > 0 ? (
                  <div className="user-posts-grid">
                    {userPosts.map(post => (
                      <div key={post.id} className="user-post-card" onClick={() => navigate(`/product/${post.id}`)}>
                        <div className="post-image">
                          <img src={post.images?.[0]?.url || `https://via.placeholder.com/300x200/1a1f36/ff6b35?text=${encodeURIComponent(post.title)}`} alt={post.title} />
                          <div className="post-overlay">
                            <span className="post-price">{t('currency')} {post.price}</span>
                          </div>
                        </div>
                        <div className="post-info">
                          <h3 className="post-title">{post.title}</h3>
                          <div className="post-stats">
                            <span><Eye size={14} /> {post.views || 0}</span>
                            <span><Heart size={14} /> {post.likes || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Package size={48} />
                    <p>{t('profile.noPosts')}</p>
                    <button className="add-post-btn" onClick={() => navigate('/add-product')}>
                      {t('profile.addFirstPost')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="favorites-section">
                <div className="empty-state">
                  <Heart size={48} />
                  <p>{t('profile.noFavorites')}</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-section">
                <div className="empty-state">
                  <MessageSquare size={48} />
                  <p>{t('profile.noReviews')}</p>
                </div>
              </div>
            )}
  
            {activeTab === 'messages' && (
              <div className="messages-section">
                <MessagesTab
                  conversations={conversations}
                  setConversations={setConversations}
                  loading={conversationsLoading}
                  setLoading={setConversationsLoading}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="settings-section">
                <div className="settings-group">
                  <h3>{t('profile.contactInfo')}</h3>
                  {isEditing ? (
                    <div className="settings-fields">
                      <div className="field-group">
                        <label>
                          <Phone size={16} />
                          {t('profile.phone')}
                        </label>
                        <input
                          type="tel"
                          value={editedUser.phoneNumber || ''}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          disabled
                        />
                      </div>
                      <div className="field-group">
                        <label>
                          <Mail size={16} />
                          {t('profile.email')}
                        </label>
                        <input
                          type="email"
                          value={editedUser.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={t('profile.emailPlaceholder')}
                        />
                      </div>
                      <div className="field-group">
                        <label>
                          <MapPin size={16} />
                          {t('profile.city')}
                        </label>
                        <input
                          type="text"
                          value={editedUser.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder={t('profile.cityPlaceholder')}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="settings-info">
                      <div className="info-item">
                        <Phone size={16} />
                        <span>{user?.phoneNumber || t('profile.noPhone')}</span>
                      </div>
                      <div className="info-item">
                        <Mail size={16} />
                        <span>{user?.email || t('profile.noEmail')}</span>
                      </div>
                      <div className="info-item">
                        <MapPin size={16} />
                        <span>{user?.city || t('profile.noCity')}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="settings-group">
                  <h3>{t('profile.accountSettings')}</h3>
                  <div className="settings-actions">
                    <button className="settings-btn">
                      <Shield size={16} />
                      {t('profile.privacySettings')}
                    </button>
                    <button className="settings-btn">
                      <Award size={16} />
                      {t('profile.verifyAccount')}
                    </button>
                    <button className="settings-btn danger" onClick={() => authService.logout()}>
                      {t('profile.logout')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ProfilePage;
                