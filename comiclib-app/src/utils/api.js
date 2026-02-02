
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      // Handle different error formats if necessary
      errorMessage = errorData.error || errorData.message || `HTTP Error ${response.status}`;
    } catch (e) {
      errorMessage = await response.text() || `HTTP Error ${response.status}`;
    }
    throw new Error(errorMessage);
  }
  // For 204 No Content, return null
  if (response.status === 204) return null;
  return response.json();
};

const api = {
  get: async (url) => {
    const response = await fetch(url);
    return handleResponse(response);
  },

  post: async (url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (url, data) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  del: async (url) => {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  upload: async (url, formData) => {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Content-Type header is not set manually for FormData to let browser set boundary
    });
    return handleResponse(response);
  }
};

export default api;
