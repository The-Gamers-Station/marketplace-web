import { API_ENDPOINTS, apiRequest } from '../config/api';

class PostService {
  // Get posts with filters and pagination
  async getPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add parameters if they exist
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.categoryIds) queryParams.append('categoryIds', params.categoryIds);
      if (params.cityId) queryParams.append('cityId', params.cityId);
      if (params.regionId) queryParams.append('regionId', params.regionId);
      if (params.type) queryParams.append('type', params.type);
      if (params.condition) queryParams.append('condition', params.condition);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.direction) queryParams.append('direction', params.direction);
      
      const url = `${API_ENDPOINTS.posts.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiRequest(url, {
        method: 'GET',
      });
      
      return response;
    } catch (error) {
      // Error fetching posts: error
      throw error;
    }
  }
  
  // Advanced search with query and filters
  async searchPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add search parameters
      if (params.q) queryParams.append('q', params.q);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.cityId) queryParams.append('cityId', params.cityId);
      if (params.regionId) queryParams.append('regionId', params.regionId);
      if (params.type) queryParams.append('type', params.type);
      if (params.condition) queryParams.append('condition', params.condition);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.direction) queryParams.append('direction', params.direction);
      if (params.sort) queryParams.append('sort', params.sort);
      
      const url = `${API_ENDPOINTS.posts.search}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(url, {
        method: 'GET',
      });
      
      return response;
    } catch (error) {
      // Error searching posts: error
      throw error;
    }
  }
  
  // Get post by ID
  async getPostById(id) {
    try {
      const response = await apiRequest(API_ENDPOINTS.posts.getById(id), {
        method: 'GET',
      });
      return response;
    } catch (error) {
      // Error fetching post: error
      throw error;
    }
  }
  
  // Create a new post
  async createPost(data) {
    try {
      // Normalize enum values and types to match backend requirements
      const normalizeType = (type) => {
        if (!type) return undefined;
        const map = {
          SALE: 'SELL',
          SELL: 'SELL',
          WANTED: 'ASK',
          ASK: 'ASK',
          EXCHANGE: 'SELL' // backend does not support EXCHANGE; fallback to SELL
        };
        return map[type] || type;
      };
  
      const normalizeCondition = (cond) => {
        if (!cond) return undefined;
        const map = {
          GOOD: 'USED_GOOD',
          FAIR: 'USED_FAIR',
          LIKE_NEW: 'LIKE_NEW',
          NEW: 'NEW',
          USED_GOOD: 'USED_GOOD',
          USED_FAIR: 'USED_FAIR',
          FOR_PARTS: 'FOR_PARTS'
        };
        return map[cond] || cond;
      };
  
      const payload = {
        title: data.title?.trim(),
        description: data.description?.trim(),
        type: normalizeType(data.type),
        condition: normalizeCondition(data.condition),
        price: data.price !== undefined && data.price !== '' ? Number(data.price) : undefined,
        priceMin: data.priceMin !== undefined && data.priceMin !== '' ? Number(data.priceMin) : undefined,
        priceMax: data.priceMax !== undefined && data.priceMax !== '' ? Number(data.priceMax) : undefined,
        categoryId: data.categoryId != null ? Number(data.categoryId) : undefined,
        cityId: data.cityId != null ? Number(data.cityId) : undefined,
        imageUrls: Array.isArray(data.imageUrls) && data.imageUrls.length > 0
          ? data.imageUrls
          : (Array.isArray(data.images) && data.images.length > 0 ? data.images : ['https://via.placeholder.com/800x600?text=Product+Image'])
      };
  
      const response = await apiRequest(API_ENDPOINTS.posts.create, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      // Error creating post: error
      throw error;
    }
  }
  
  // Update a post
  async updatePost(id, data) {
    try {
      const response = await apiRequest(API_ENDPOINTS.posts.update(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      // Error updating post: error
      throw error;
    }
  }
  
  // Delete a post
  async deletePost(id) {
    try {
      const response = await apiRequest(API_ENDPOINTS.posts.delete(id), {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      // Error deleting post: error
      throw error;
    }
  }
  
  // Get my posts
  async getMyPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.direction) queryParams.append('direction', params.direction);
      
      const url = `${API_ENDPOINTS.posts.myPosts}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(url, {
        method: 'GET',
      });
      
      return response;
    } catch (error) {
      // Error fetching my posts: error
      throw error;
    }
  }
  
  // Mark post as sold
  async markAsSold(id) {
    try {
      const response = await apiRequest(API_ENDPOINTS.posts.markAsSold(id), {
        method: 'POST',
      });
      return response;
    } catch (error) {
      // Error marking post as sold: error
      throw error;
    }
  }
  
  // Map category IDs to proper display names
  getCategoryDisplayName(categoryId) {
    const categoryMap = {
      100: 'PlayStation Devices',
      101: 'PlayStation Games',
      102: 'PlayStation Accessories',
      200: 'Xbox Devices',
      201: 'Xbox Games',
      202: 'Xbox Accessories',
      300: 'Nintendo Devices',
      301: 'Nintendo Games',
      302: 'Nintendo Accessories'
    };
    
    const arabicCategoryMap = {
      100: 'أجهزة بلايستيشن',
      101: 'ألعاب بلايستيشن',
      102: 'إكسسوارات بلايستيشن',
      200: 'أجهزة إكس بوكس',
      201: 'ألعاب إكس بوكس',
      202: 'إكسسوارات إكس بوكس',
      300: 'أجهزة نينتندو',
      301: 'ألعاب نينتندو',
      302: 'إكسسوارات نينتندو'
    };
    
    // Check if we're in Arabic mode (you might need to pass language as parameter)
    const isArabic = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
    const map = isArabic ? arabicCategoryMap : categoryMap;
    
    return map[categoryId] || 'Uncategorized';
  }
  
  // Transform backend post to frontend product format
  transformPostToProduct(post) {
    return {
      id: post.id,
      title: post.title,
      price: post.price || post.priceMin,
      originalPrice: post.priceMax, // Use priceMax as original price for discount calculation
      image: post.images && post.images.length > 0 ? post.images[0].url : '/placeholder.jpg',
      images: post.images || [],
      rating: 4.5, // Default rating since backend doesn't have ratings yet
      reviews: 0, // Default reviews count
      category: this.getCategoryDisplayName(post.categoryId) || post.categoryName || 'Uncategorized',
      categoryId: post.categoryId,
      description: post.description,
      condition: post.condition,
      type: post.type,
      status: post.status,
      cityName: post.cityName,
      cityId: post.cityId,
      ownerId: post.ownerId,
      ownerUsername: post.ownerUsername,
      store: post.store,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      // Calculate if on sale based on price difference
      onSale: post.priceMax && post.priceMin && post.priceMax > post.priceMin,
      // Calculate discount percentage
      discount: post.priceMax && post.priceMin && post.priceMax > post.priceMin 
        ? Math.round(((post.priceMax - post.priceMin) / post.priceMax) * 100)
        : 0,
    };
  }
  
  // Transform multiple posts
  transformPosts(posts) {
    return posts.map(post => this.transformPostToProduct(post));
  }
}

const postService = new PostService();

export { postService };
export default postService;