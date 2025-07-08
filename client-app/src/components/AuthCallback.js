import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh_token');
      const expiresIn = searchParams.get('expires_in');
      const error = searchParams.get('error');

      if (error) {
        setError(getErrorMessage(error));
        setStatus('error');
        return;
      }

      if (!token || !refreshToken) {
        setError('Invalid callback parameters');
        setStatus('error');
        return;
      }

      // Get user info
      const userResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Login the user
      login(
        {
          accessToken: token,
          refreshToken: refreshToken,
          expiresIn: expiresIn
        },
        userResponse.data.user
      );

      setStatus('success');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Auth callback error:', error);
      setError('Authentication failed. Please try again.');
      setStatus('error');
    }
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth_failed': 'Authentication failed. Please try again.',
      'access_denied': 'Access denied. Please grant necessary permissions.',
      'invalid_state': 'Invalid authentication state. Please try again.',
      'cancelled': 'Authentication was cancelled.',
    };
    return errorMessages[errorCode] || 'An authentication error occurred.';
  };

  const handleRetry = () => {
    navigate('/login');
  };

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-card">
        {status === 'processing' && (
          <div className="callback-processing">
            <div className="spinner"></div>
            <h2>Completing authentication...</h2>
            <p>Please wait while we log you in.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="callback-success">
            <FaCheckCircle className="success-icon icon-success" />
            <h2>Authentication successful!</h2>
            <p>You will be redirected to your dashboard shortly.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="callback-error">
            <FaTimesCircle className="error-icon icon-error" />
            <h2>Authentication failed</h2>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={handleRetry}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;