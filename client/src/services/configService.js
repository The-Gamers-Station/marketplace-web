import { apiRequest } from '../config/api';

/**
 * Service for fetching system configuration
 */
class ConfigService {
  /**
   * Get order pricing configuration (shipping fee, service fee %)
   */
  async getOrderPricing() {
    try {
      const response = await apiRequest('/config/order-pricing', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching order pricing:', error);
      throw error;
    }
  }

  /**
   * Calculate order total
   */
  async calculateTotal(productPrice) {
    try {
      const response = await apiRequest(`/config/calculate-total?productPrice=${productPrice}`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error calculating total:', error);
      throw error;
    }
  }

  /**
   * Get public configurations
   */
  async getPublicConfigs() {
    try {
      const response = await apiRequest('/config/public', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching public configs:', error);
      throw error;
    }
  }

  /**
   * Get configs by category
   */
  async getConfigsByCategory(category) {
    try {
      const response = await apiRequest(`/config/category/${category}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching configs by category:', error);
      throw error;
    }
  }

  /**
   * Get specific config value
   */
  async getConfigValue(key) {
    try {
      const response = await apiRequest(`/config/${key}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching config value:', error);
      throw error;
    }
  }
}

const configService = new ConfigService();

export { configService };
export default configService;