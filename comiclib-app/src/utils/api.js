
const handleResponse = async (response) => {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = (data && (data.error || data.message)) || text || `HTTP Error ${response.status}`;
    throw new Error(errorMessage);
  }

  // For 204 No Content, return null (logic handled by text check above effectively, but explicit check for status is fine too)
  if (response.status === 204) return null;

  return data;
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
