import { API_ENDPOINTS, apiRequest } from '../config/api';

class CityService {
  // Get all cities or filter by region
  async getCities(regionId = null) {
    try {
      const params = regionId ? `?regionId=${regionId}` : '';
      const response = await apiRequest(`/cities${params}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }
}

const cityService = new CityService();

export { cityService };
export default cityService;