import { API_ENDPOINTS, apiRequest, buildApiUrl } from '../config/api';

class AuthService {
  // Store tokens in local storage
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
  
  // Clear tokens
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  
  // Get current user from storage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
  
  // Request OTP
  async requestOtp(phoneNumber) {
    try {
      const response = await apiRequest(API_ENDPOINTS.auth.requestOtp, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      });
      return response;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      throw error;
    }
  }
  
  // Verify OTP and login
  async verifyOtp(phoneNumber, code) {
    try {
      const response = await apiRequest(API_ENDPOINTS.auth.verifyOtp, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, code }),
      });
      
      // Store tokens and user data
      if (response.accessToken && response.refreshToken) {
        this.setTokens(response.accessToken, response.refreshToken);
        
        // Store user information
        const user = {
          userId: response.userId,
          phoneNumber: response.phoneNumber,
          role: response.role,
          profileCompleted: response.profileCompleted,
          isNewUser: response.isNewUser,
        };
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }
  
  // Refresh access token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.refresh), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      
      // Update tokens
      if (data.accessToken && data.refreshToken) {
        this.setTokens(data.accessToken, data.refreshToken);
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear tokens on refresh failure
      this.clearTokens();
      throw error;
    }
  }
  
  // Logout
  logout() {
    this.clearTokens();
    // Redirect to login page
    window.location.href = '/login';
  }
  
  // Format phone number to Saudi format
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it starts with country code
    if (cleaned.startsWith('966')) {
      return `+${cleaned}`;
    }
    
    // Check if it starts with 0, remove it
    if (cleaned.startsWith('0')) {
      return `+966${cleaned.substring(1)}`;
    }
    
    // Otherwise add country code
    return `+966${cleaned}`;
  }
  
  // Validate Saudi phone number
  validatePhoneNumber(phoneNumber) {
    const regex = /^\+966[0-9]{9}$/;
    return regex.test(phoneNumber);
  }
}

const authService = new AuthService();

export { authService };
export default authService;