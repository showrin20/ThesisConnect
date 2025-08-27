import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../axios';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  LOGOUT: 'LOGOUT',
  AUTH_ERROR: 'AUTH_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_USER: 'LOAD_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AuthActionTypes.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case AuthActionTypes.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case AuthActionTypes.AUTH_ERROR:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  // Load user from token
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      try {
        const response = await axios.get('/auth/me');
        dispatch({
          type: AuthActionTypes.LOAD_USER,
          payload: response.data,
        });
      } catch (error) {
        console.error('Load user error:', error);
        
        // More specific error handling
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
          dispatch({ 
            type: AuthActionTypes.AUTH_ERROR, 
            payload: 'Session expired. Please login again.' 
          });
        } else if (error.response?.status === 404) {
          // API route not found
          console.error('Auth API endpoint not found. Check server configuration.');
          dispatch({ 
            type: AuthActionTypes.AUTH_ERROR, 
            payload: 'Server configuration error. Please contact support.' 
          });
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
          // Network error or server not running
          console.error('Network error or server not running.');
          dispatch({ 
            type: AuthActionTypes.AUTH_ERROR, 
            payload: 'Cannot connect to server. Please check if the server is running.' 
          });
        } else {
          // Other errors
          dispatch({ 
            type: AuthActionTypes.AUTH_ERROR, 
            payload: error.response?.data?.msg || 'Failed to load user data.' 
          });
        }
      }
    } else {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  };

  // Register user
  const register = async (userData) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    try {
      const response = await axios.post('/auth/register', userData);

      dispatch({
        type: AuthActionTypes.REGISTER_SUCCESS,
        payload: response.data,
      });
      
      // Set token in axios headers
      setAuthToken(response.data.token);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error);
      const errorMsg = error.response?.data?.msg || 'Registration failed';
      dispatch({
        type: AuthActionTypes.AUTH_ERROR,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };

  // Login user
  const login = async (credentials) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    try {
      const response = await axios.post('/auth/login', credentials);

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: response.data,
      });
      
      // Set token in axios headers
      setAuthToken(response.data.token);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.msg || 'Login failed';
      dispatch({
        type: AuthActionTypes.AUTH_ERROR,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };
  
  // Google login
  const loginWithGoogle = async (googleData) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    try {
      const response = await axios.post('/auth/google-login', googleData);

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: response.data,
      });
      
      // Set token in axios headers
      setAuthToken(response.data.token);
      
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Google login error:', error);
      const errorMsg = error.response?.data?.msg || 'Google authentication failed';
      dispatch({
        type: AuthActionTypes.AUTH_ERROR,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AuthActionTypes.LOGOUT });
      setAuthToken(null);
    }
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  // Update user profile
  const updateUser = async (userData) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    try {
      const response = await axios.put('/auth/profile', userData);
      
      // Handle the response properly - the user data is in response.data.user
      dispatch({
        type: AuthActionTypes.LOAD_USER,
        payload: response.data.user,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update user error:', error);
      const errorMsg = error.response?.data?.msg || 'Update failed';
      dispatch({
        type: AuthActionTypes.AUTH_ERROR,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    } finally {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  };

  // Load user on mount and set token in axios if exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
    loadUser();
  }, []);

  // Forgot password
  const forgotPassword = async (email) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMsg = error.response?.data?.msg || 'Password reset request failed';
      dispatch({
        type: AuthActionTypes.AUTH_ERROR,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    try {
      const response = await axios.post('/auth/reset-password', { resetToken, password });
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMsg = error.response?.data?.msg || 'Password reset failed';
      dispatch({
        type: AuthActionTypes.AUTH_ERROR,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    ...state,
    register,
    login,
    loginWithGoogle,
    logout,
    clearError,
    loadUser,
    updateUser,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
