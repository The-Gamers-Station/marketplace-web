
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
  MessageSquare,
  Award,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Tag,
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { PageLoader } from '../../components/Loading/Loading';
import SuccessPopup from '../../components/SuccessPopup/SuccessPopup';
import MessagesTab from '../../components/MessagesTab/MessagesTab';
import authService from '../../services/authService';
import userService from '../../services/userService';
import postService from '../../services/postService';
import messagingService from '../../services/messagingService';
import { uploadFile } from '../../config/api';
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [backgroundUploading, setBackgroundUploading] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    rating: 0,
    joinDate: null
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    if (tab && ['posts', 'messages'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Fetch unread messages count
  useEffect(() => {
    let unsubscribe;
    
    const fetchUnreadCount = async () => {
      if (authService.isAuthenticated()) {
        try {
          const count = await messagingService.getUnreadCount();
          setUnreadMessagesCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
          setUnreadMessagesCount(0);
        }
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages to update count in real-time
    if (authService.isAuthenticated()) {
      messagingService.subscribeToMessages((message) => {
        if (!message.isOwn) {
          setUnreadMessagesCount(prev => prev + 1);
        }
      }).then(unsub => {
        unsubscribe = unsub;
      }).catch(error => {
        console.error('Error subscribing to messages:', error);
      });
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
    setImagePreview(null);
    setBackgroundPreview(null);
  };

  const handleSaveProfile = async () => {
    try {
      if (avatarUploading || backgroundUploading) {
        throw new Error('Image upload in progress. Please wait.');
      }
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
      
      // If there's a new profile image URL, add it to the update data (only allow http/https)
      if (imagePreview && /^https?:\/\//.test(imagePreview)) {
        updateData.profileImage = imagePreview;
      }
      
      // If there's a new background image URL, add it to the update data (only allow http/https)
      if (backgroundPreview && /^https?:\/\//.test(backgroundPreview)) {
        updateData.backgroundImage = backgroundPreview;
      }
      
      // Update user profile
      const updatedUser = await userService.updateProfile(updateData);
      
      // Update local state with the response
      setUser(updatedUser);
      setEditedUser(updatedUser);
      
      setIsEditing(false);
      setImagePreview(null);
      setBackgroundPreview(null);
      
      // Show success popup
      setPopupTitle(t('profile.updateSuccessTitle') || 'Profile Updated!');
      setPopupMessage(t('profile.updateSuccess') || 'Your profile has been updated successfully.');
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error popup
      setPopupTitle(t('profile.updateErrorTitle') || 'Update Failed');
      setPopupMessage(t('profile.updateError') || 'Failed to update profile. Please try again.');
      setShowSuccessPopup(true);
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

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type/size (mirror backend)
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES) {
      console.error('Invalid image selected');
      return;
    }

    try {
      setAvatarUploading(true);
      // Quick local preview while uploading
      const tempUrl = URL.createObjectURL(file);
      setImagePreview(tempUrl);

      const result = await uploadFile(file, 'avatars');
      if (result?.url) {
        setImagePreview(result.url);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Handle background image upload
  const handleBackgroundChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES) {
      console.error('Invalid background image selected');
      return;
    }

    try {
      setBackgroundUploading(true);
      const tempUrl = URL.createObjectURL(file);
      setBackgroundPreview(tempUrl);

      const result = await uploadFile(file, 'backgrounds');
      if (result?.url) {
        setBackgroundPreview(result.url);
      }
    } catch (err) {
      console.error('Background upload failed:', err);
    } finally {
      setBackgroundUploading(false);
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

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    
    try {
      setDeleteLoading(true);
      await postService.deletePost(deleteProductId);
      
      // Remove the product from the list
      setUserPosts(prev => prev.filter(post => post.id !== deleteProductId));
      
      // Show success popup
      setPopupTitle(t('profile.deleteSuccessTitle') || 'Product Deleted!');
      setPopupMessage(t('profile.deleteSuccess') || 'Your product has been deleted successfully.');
      setShowSuccessPopup(true);
      
      // Close the modal
      setShowDeleteModal(false);
      setDeleteProductId(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      // Show error popup
      setPopupTitle(t('profile.deleteErrorTitle') || 'Delete Failed');
      setPopupMessage(t('profile.deleteError') || 'Failed to delete product. Please try again.');
      setShowSuccessPopup(true);
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
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
                      <button className="save-btn" onClick={handleSaveProfile} disabled={avatarUploading || backgroundUploading}>
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
              className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageSquare size={18} />
              {t('chat.messages')}
              {/* Show unread count if any */}
              {unreadMessagesCount > 0 && (
                <span className="unread-badge">{unreadMessagesCount}</span>
              )}
            </button>
            {/* Settings tab commented out
            <button
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              {t('profile.settings')}
            </button>
            */}
          </div>

          {/* Tab Content */}
          <div className="profile-content">
            {activeTab === 'posts' && (
              <div className="posts-section">
                {userPosts.length > 0 ? (
                  <div className="user-posts-list list-view">
                    {userPosts.map(post => (
                      <div key={post.id} className="user-post-item" onClick={() => navigate(`/product/${post.id}`)}>
                        <div className="post-item-image">
                          <img src={post.images?.[0]?.url || `https://via.placeholder.com/150x150/1a1f36/ff6b35?text=${encodeURIComponent(post.title)}`} alt={post.title} />
                          <div className="post-type-badge">
                            {post.type === 'SELL' ? t('productType.forSale') : t('productType.wanted')}
                          </div>
                        </div>
                        <div className="post-item-content">
                          <div className="post-item-header">
                            <h3 className="post-item-title">{post.title}</h3>
                            <span className={`condition-badge ${post.condition?.toLowerCase()}`}>
                              {post.condition && t(`addProduct.conditions.${post.condition.toLowerCase()}`)}
                            </span>
                          </div>
                          <div className="post-item-details">
                            <div className="detail-item">
                              <DollarSign size={14} />
                              <span>{t('currency')} {post.price}</span>
                            </div>
                            <div className="detail-item">
                              <MapPin size={14} />
                              <span>{post.cityName}</span>
                            </div>
                            <div className="detail-item">
                              <Clock size={14} />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="post-item-actions">
                          <button
                            className="post-action-btn edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/edit-product/${post.id}`);
                            }}
                            title={t('profile.editProduct')}
                          >
                            <Edit size={18} />
                            <span>{t('common.edit')}</span>
                          </button>
                          <button
                            className="post-action-btn delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteProductId(post.id);
                              setShowDeleteModal(true);
                            }}
                            title={t('profile.deleteProduct')}
                          >
                            <Trash2 size={18} />
                            <span>{t('common.delete')}</span>
                          </button>
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

            {/* Settings section commented out
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
            */}
          </div>
        </div>
      </main>
       
      
      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title={popupTitle}
        message={popupMessage}
        autoClose={true}
        autoCloseDelay={3000}
      />
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Trash2 size={24} />
                {t('profile.deleteProductTitle')}
              </h2>
            </div>
            <div className="modal-body">
              {t('profile.deleteProductMessage')}
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteProductId(null);
                }}
                disabled={deleteLoading}
              >
                {t('common.cancel')}
              </button>
              <button
                className="modal-btn modal-btn-delete"
                onClick={handleDeleteProduct}
                disabled={deleteLoading}
              >
                {deleteLoading ? t('common.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
                
                
