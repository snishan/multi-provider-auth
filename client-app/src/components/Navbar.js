import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <Link to="/" style={{ fontWeight: 700, color: '#4f3ca7', fontSize: '1.2rem', textDecoration: 'none', marginRight: '1.5rem' }}>Social Login App</Link>
      </div>
      <div>
        {!user ? (
          <></>
        ) : (
          <button className="logout-btn" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleLogout}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
            ) : (
              <span style={{ fontWeight: 700, color: '#fff', background: '#764ba2', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
            )}
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 