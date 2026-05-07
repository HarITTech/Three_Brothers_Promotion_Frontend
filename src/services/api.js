const API_BASE_URL = 'https://three-brothers-promotion-backend.onrender.com/api/v1';
// const API_BASE_URL = 'http://localhost:3000/api/v1';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('adminToken');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.message)) {
        errorMsg = errorData.message.join(', ');
      } else {
        errorMsg = errorData.message || errorMsg;
      }
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMsg);
  }
  
  // If the response is 201 Created and has no body (or empty body), parsing JSON might fail.
  try {
    return await response.json();
  } catch (e) {
    return {};
  }
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },
  register: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  // Generic fetch for public data (user side)
  getSectionData: async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}`);
      if (!res.ok) return null;
      const data = await res.json();
      // Usually returns an array of documents, we take the first one or the whole response based on API design
      // If it's an array and not empty, return first item. Otherwise return data.
      if (Array.isArray(data) && data.length > 0) return data[0];
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  },

  // Generic methods for admin side
  createSectionData: async (endpoint, data) => {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateSectionData: async (endpoint, id, data) => {
    const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteSectionData: async (endpoint, id) => {
    const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  
  // Custom POST/PUT methods for nested arrays (like Add Protocol, Add Team Member)
  customPost: async (endpoint, data, isFormData = false) => {
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse(res);
  },
  customPut: async (endpoint, data, isFormData = false) => {
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const res = await fetch(fullUrl, {
      method: 'PUT',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse(res);
  },
  customDelete: async (endpoint) => {
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const res = await fetch(fullUrl, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  }
};
