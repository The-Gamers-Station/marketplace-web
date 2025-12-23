import { API_ENDPOINTS, apiRequest } from '../config/api';

class UserService {
  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const response = await apiRequest('/users/me', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      // Error fetching user profile: error
      throw error;
    }
  }

  // Update current user profile (for completing profile after registration)
  async updateProfile(data) {
    try {
      const response = await apiRequest('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      // Update stored user data
      if (response.profileCompleted) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.profileCompleted = true;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response;
    } catch (error) {
      // Error updating user profile: error
      throw error;
    }
  }

  // Get public user profile
  async getUserById(userId) {
    try {
      const response = await apiRequest(API_ENDPOINTS.users.publicProfile(userId), {
        method: 'GET',
      });
      return response;
    } catch (error) {
      // Error fetching public user profile: error
      throw error;
    }
  }
}

const userService = new UserService();

export { userService };
export default userService;