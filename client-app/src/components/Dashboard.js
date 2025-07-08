import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Dashboard.css';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { VscAzure } from "react-icons/vsc";

const Dashboard = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProviders();
  }, []);

  const fetchUserProviders = async () => {
    try {
      const response = await api.get('/user/providers');
      setProviders(response.data.providers);
    } catch (error) {
      console.error('Failed to fetch user providers:', error);
      setError('Failed to load provider information');
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div className="user-welcome">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="user-info">
            <h1>Welcome back, {user?.name}!</h1>
            <p className="user-email">{user?.email}</p>
            <p className="user-since">
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>
      </div>
      {/* Loading and error states */}
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="providers-section">
          <h2>Linked Providers</h2>
          {providers.length === 0 ? (
            <div>No providers linked to your account.</div>
          ) : (
            <ul className="providers-list">
              {providers.map((provider) => (
                <li key={provider.name} className="provider-item">
                  <span className="provider-icon">{getProviderIcon(provider.name)}</span>
                  <span className="provider-name">{provider.displayName || provider.name}</span>
                  {provider.linkedAt && (
                    <span className="provider-linked-at">Linked on {formatDate(provider.linkedAt)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;