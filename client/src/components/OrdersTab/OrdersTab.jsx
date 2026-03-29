import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Package,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Loader2,
  AlertCircle,
  Shield,
  TrendingUp
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { showError } from '../ErrorNotification/ErrorNotification';
import './OrdersTab.css';

const OrdersTab = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  
  const [activeSubTab, setActiveSubTab] = useState('purchases');
  const [myPurchases, setMyPurchases] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const [purchases, orders] = await Promise.all([
        orderService.getMyPurchases(),
        orderService.getCustomerOrders()
      ]);
      
      setMyPurchases(purchases);
      setCustomerOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: 'accept' }));
      await orderService.acceptOrder(orderId);
      
      // Update the order status in the list
      setCustomerOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: 'ACCEPTED' } : order
        )
      );
      
      // Show success message
      showError({
        messageAr: 'تم قبول الطلب بنجاح',
        messageEn: 'Order accepted successfully'
      });
    } catch (error) {
      console.error('Error accepting order:', error);
      showError(error);
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: 'reject' }));
      await orderService.rejectOrder(orderId);
      
      // Update the order status in the list
      setCustomerOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: 'REJECTED' } : order
        )
      );
      
      // Show success message
      showError({
        messageAr: 'تم رفض الطلب',
        messageEn: 'Order rejected'
      });
    } catch (error) {
      console.error('Error rejecting order:', error);
      showError(error);
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      REQUESTED: {
        icon: Clock,
        class: 'status-requested',
        label: t('orders.status.requested')
      },
      ACCEPTED: {
        icon: CheckCircle,
        class: 'status-accepted',
        label: t('orders.status.accepted')
      },
      REJECTED: {
        icon: XCircle,
        class: 'status-rejected',
        label: t('orders.status.rejected')
      },
      PAID: {
        icon: CheckCircle,
        class: 'status-paid',
        label: t('orders.status.paid')
      }
    };

    const config = statusConfig[status] || statusConfig.REQUESTED;
    const StatusIcon = config.icon;

    return (
      <span className={`status-badge ${config.class}`}>
        <StatusIcon size={16} />
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOrderCard = (order, isPurchase = false) => {
    const isRequested = order.status === 'REQUESTED';
    const isAccepted = order.status === 'ACCEPTED';
    const currentActionLoading = actionLoading[order.id];

    return (
      <div key={order.id} className="order-card">
        <div className="order-card-header">
          <div className="order-header-left">
            <div className="order-id">
              <Shield size={16} />
              <span>{t('orders.orderNumber')}: #{order.id}</span>
            </div>
            <div className="order-date">
              <Clock size={14} />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <div className="order-header-right">
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="order-card-body">
          {/* Product Info */}
          <div 
            className="order-product-info"
            onClick={() => navigate(`/product/${order.post?.id}`)}
          >
            <div className="product-image">
              <img
                src={order.post?.images?.[0]?.url || '/placeholder-game.svg'}
                alt={order.post?.title || t('orders.product')}
              />
            </div>
            <div className="product-details">
              <h4 className="product-title">{order.post?.title || t('orders.product')}</h4>
              <div className="product-meta">
                <span className="product-price">
                  {t('currency')} {Number(order.productPrice || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown">
            <div className="price-row">
              <span>{t('orders.productPrice')}</span>
              <span>{t('currency')} {Number(order.productPrice || 0).toLocaleString()}</span>
            </div>
            <div className="price-row">
              <span>{t('orders.shippingFee')}</span>
              <span>{t('currency')} {Number(order.shippingFee || 0).toLocaleString()}</span>
            </div>
            <div className="price-row">
              <span>{t('orders.serviceFee')}</span>
              <span>{t('currency')} {(Number(order.productPrice || 0) * 0.04).toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>{t('orders.total')}</span>
              <span className="total-amount">{t('currency')} {Number(order.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="shipping-info">
            <h5 className="shipping-title">{t('orders.shippingAddress')}</h5>
            <div className="shipping-details">
              <div className="shipping-row">
                <User size={14} />
                <span>{order.recipientName}</span>
              </div>
              <div className="shipping-row">
                <Phone size={14} />
                <span>{order.recipientPhone}</span>
              </div>
              <div className="shipping-row">
                <MapPin size={14} />
                <span>{order.recipientCity} - {order.recipientDistrict}</span>
              </div>
              <div className="shipping-row">
                <MapPin size={14} />
                <span>{order.recipientStreet}</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="order-user-info">
            {isPurchase ? (
              <>
                <span className="user-label">{t('orders.seller')}:</span>
                <span className="user-name">{order.seller?.username || t('common.anonymous')}</span>
              </>
            ) : (
              <>
                <span className="user-label">{t('orders.buyer')}:</span>
                <span className="user-name">{order.buyer?.username || t('common.anonymous')}</span>
              </>
            )}
          </div>

          {/* Actions for Seller (Customer Orders) */}
          {!isPurchase && isRequested && (
            <div className="order-actions">
              <button
                className="action-btn accept-btn"
                onClick={() => handleAcceptOrder(order.id)}
                disabled={currentActionLoading}
              >
                {currentActionLoading === 'accept' ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <CheckCircle size={16} />
                )}
                <span>{t('orders.acceptRequest')}</span>
              </button>
              <button
                className="action-btn reject-btn"
                onClick={() => handleRejectOrder(order.id)}
                disabled={currentActionLoading}
              >
                {currentActionLoading === 'reject' ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <XCircle size={16} />
                )}
                <span>{t('orders.reject')}</span>
              </button>
            </div>
          )}

          {/* Pay Now message for Buyer */}
          {isPurchase && isAccepted && (
            <div className="pay-now-notice">
              <AlertCircle size={16} />
              <span>{t('orders.payNowMessage')}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <Loader2 className="spinner" size={48} />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="orders-tab">
      {/* Sub-tabs */}
      <div className="orders-subtabs">
        <button
          className={`subtab-btn ${activeSubTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('purchases')}
        >
          <ShoppingBag size={18} />
          <span>{t('orders.myPurchases')}</span>
          {myPurchases.length > 0 && (
            <span className="count-badge">{myPurchases.length}</span>
          )}
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'customer-orders' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('customer-orders')}
        >
          <TrendingUp size={18} />
          <span>{t('orders.customerOrders')}</span>
          {customerOrders.length > 0 && (
            <span className="count-badge">{customerOrders.length}</span>
          )}
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="orders-content">
        {activeSubTab === 'purchases' && (
          <div className="purchases-section">
            {myPurchases.length > 0 ? (
              <div className="orders-list">
                {myPurchases.map(order => renderOrderCard(order, true))}
              </div>
            ) : (
              <div className="empty-state">
                <ShoppingBag size={64} />
                <h3>{t('orders.noPurchases')}</h3>
                <p>{t('orders.noPurchasesDesc')}</p>
                <button
                  className="browse-btn"
                  onClick={() => navigate('/')}
                >
                  {t('orders.browseProducts')}
                </button>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'customer-orders' && (
          <div className="customer-orders-section">
            {customerOrders.length > 0 ? (
              <div className="orders-list">
                {customerOrders.map(order => renderOrderCard(order, false))}
              </div>
            ) : (
              <div className="empty-state">
                <TrendingUp size={64} />
                <h3>{t('orders.noCustomerOrders')}</h3>
                <p>{t('orders.noCustomerOrdersDesc')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTab;
