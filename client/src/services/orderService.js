import { API_ENDPOINTS, apiRequest } from '../config/api';

class OrderService {
  /**
   * Create a new order
   */
  async createOrder(data) {
    const payload = {
      postId: data.postId,
      shippingName: data.shippingName,
      shippingPhone: data.shippingPhone,
      shippingCity: data.shippingCity,
      shippingDistrict: data.shippingDistrict,
    };

    const response = await apiRequest(API_ENDPOINTS.orders.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    return response;
  }

  /**
   * Accept an order (seller action)
   */
  async acceptOrder(orderId) {
    const response = await apiRequest(API_ENDPOINTS.orders.accept(orderId), {
      method: 'POST',
    });
    
    return response;
  }

  /**
   * Reject an order (seller action)
   */
  async rejectOrder(orderId) {
    const response = await apiRequest(API_ENDPOINTS.orders.reject(orderId), {
      method: 'POST',
    });
    
    return response;
  }

  /**
   * Get buyer's purchases
   */
  async getMyPurchases() {
    const response = await apiRequest(API_ENDPOINTS.orders.myPurchases, {
      method: 'GET',
    });
    
    return response;
  }

  /**
   * Get seller's customer orders
   */
  async getCustomerOrders() {
    const response = await apiRequest(API_ENDPOINTS.orders.customerOrders, {
      method: 'GET',
    });
    
    return response;
  }
}

const orderService = new OrderService();

export { orderService };
export default orderService;
