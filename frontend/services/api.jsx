import axios from 'axios';
import { API_BASE_URL } from '../src/config';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    getCurrentUser: () => api.get('/auth/me'),

};

export const ticketsAPI = {
    getAll: (status= null) => {
        const params = status ? { status } : {};
        return api.get('/tickets', { params });
    },
    getById: (id) => api.get(`/tickets/${id}`),
    create: (data) => api.post('/tickets', data),
    changeStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
    addComment: (id, body) => api.post(`/tickets/${id}/comments`, body),
    delete: (id, data) => api.put(`/tickets/${id}`, data),

};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard'),
};

export const userApi = {
    getAll: async (includeInactive = false) => {
        try {
            const url = includeInactive 
            ? `${API_BASE_URL}/users?includeInactive=true`
            : `${API_BASE_URL}/users`;

            const response = await fetch(url, {
                method: 'GET',
                headers: createHeaders(),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching users:', error);
            return { error: error.message };
       }
    },

    getById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'GET',
                headers: createHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    },

    // Get current user profile
    getMyProfile: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'GET',
                headers: createHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    // Create new user (Admin only)
    create: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify(userData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Update user
    update: async (id, userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'PUT',
                headers: createHeaders(),
                body: JSON.stringify(userData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            return { success: true };
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    },

    // Change password
    changePassword: async (id, currentPassword, newPassword) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}/password`, {
                method: 'PUT',
                headers: createHeaders(),
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },


    // Delete user (Admin only - soft delete)
    delete: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: createHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return { success: true };
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    },
    // Grant permission to user (Admin only)
    grantPermission: async (id, permissionData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}/permissions`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify(permissionData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error granting permission:', error);
            throw error;
        }
    },

    // Revoke permission from user (Admin only)
    revokePermission: async (id, permissionType) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}/permissions/${permissionType}`, {
                method: 'DELETE',
                headers: createHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error revoking permission:', error);
            throw error;
        }
    },

    // Get all military ranks
    getRanks: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/ranks`, {
                method: 'GET',
                headers: createHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching military ranks:', error);
            throw error;
        }
    },
};
                
function createHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}   

export default api; 