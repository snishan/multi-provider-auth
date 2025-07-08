import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Login.css';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { VscAzure } from "react-icons/vsc";
import logo from '../logo.svg';


const Login = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchProviders();
    
    // Check for error in URL params
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(getErrorMessage(urlError));
    }
  }, [searchParams]);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/auth/providers');
      setProviders(response.data.providers);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      setError('Failed to load authentication providers');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth_failed': 'Authentication failed. Please try again.',
      'google_auth_failed': 'Google authentication failed. Please try again.',
      'github_auth_failed': 'GitHub authentication failed. Please try again.',
      'azure_auth_failed': 'Microsoft authentication failed. Please try again.',
      'token_generation_failed': 'Token generation failed. Please try again.',
      'access_denied': 'Access denied. Please grant necessary permissions.',
      'invalid_state': 'Invalid authentication state. Please try again.',
      'cancelled': 'Authentication was cancelled.',
    };
    return errorMessages[errorCode] || 'An authentication error occurred.';
  };

  const handleSocialLogin = (provider) => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/${provider}`;
  };

  const getProviderIcon = (provider) => {
    const iconStyle = { width: 24, height: 24, verticalAlign: 'middle', marginRight: 8 };
    const icons = {
      google: <FaGoogle style={iconStyle} />,
      github: <FaGithub style={iconStyle} />,
      azure: <VscAzure style={iconStyle} />
    };
    return icons[provider];
  };

  const getProviderColor = (provider) => {
    const colors = {
      google: '#db4437',
      github: '#333',
      azure: '#0078d4'
    };
    return colors[provider] || '#007bff';
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-brand">
        <img src={logo} alt="App Logo" className="login-logo" />
        <h2 className="login-app-name">Social Login App</h2>
      </div>
      <div className="login-card fade-in">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account using one of the following providers</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
            <button 
              className="error-close"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className="login-providers">
          {providers.map((provider) => (
            <button
              key={provider.name}
              className="provider-button"
              onClick={() => handleSocialLogin(provider.name)}
              disabled={!provider.enabled}
              style={{
                backgroundColor: provider.enabled ? getProviderColor(provider.name) : '#ccc',
                borderColor: provider.enabled ? getProviderColor(provider.name) : '#ccc'
              }}
            >
              <span className="provider-icon">
                {getProviderIcon(provider.name)}
              </span>
              <span className="provider-text">
                Continue with {provider.displayName}
              </span>
              {!provider.enabled && (
                <span className="provider-disabled">(Not configured)</span>
              )}
            </button>
          ))}
        </div>

        <div className="login-footer">
          <p>
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;