const express = require('express');
const passport = require('passport');
const { createTokensForUser, authenticateToken, verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const router = express.Router();

// Helper function to handle OAuth success
const handleOAuthSuccess = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    // Create JWT tokens
    const tokens = createTokensForUser(req.user);
    
    // Redirect to frontend with tokens
    const redirectUrl = new URL('/auth/callback', process.env.FRONTEND_URL);
    redirectUrl.searchParams.append('token', tokens.accessToken);
    redirectUrl.searchParams.append('refresh_token', tokens.refreshToken);
    redirectUrl.searchParams.append('expires_in', tokens.expiresIn);
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('OAuth success handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
  }
};

// Google OAuth Routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
  handleOAuthSuccess
);

// GitHub OAuth Routes
router.get('/github',
  passport.authenticate('github', { 
    scope: ['user:email'] 
  })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login?error=github_auth_failed' }),
  handleOAuthSuccess
);

// Azure AD OAuth Routes
router.get('/azure',
  passport.authenticate('azuread-openidconnect', { 
    failureRedirect: '/login?error=azure_auth_failed' 
  })
);

router.get('/azure/callback',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/login?error=azure_auth_failed' }),
  handleOAuthSuccess
);

// Token refresh endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token required' 
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      return res.status(400).json({ 
        error: 'Invalid refresh token' 
      });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Generate new tokens
    const tokens = createTokensForUser(user);
    
    res.json({
      success: true,
      ...tokens,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      error: 'Invalid refresh token' 
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user information' 
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a production app, you might want to maintain a token blacklist
    // For now, we'll just respond with success
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Failed to logout' 
    });
  }
});

// Link additional provider to existing account
router.post('/link/:provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;
    const supportedProviders = ['google', 'github', 'azure'];
    
    if (!supportedProviders.includes(provider)) {
      return res.status(400).json({ 
        error: 'Unsupported provider' 
      });
    }

    // Store user ID in session for linking
    req.session.linkUserId = req.user.id;
    
    // Redirect to OAuth provider
    const authUrl = `/api/auth/${provider}`;
    res.json({ 
      success: true, 
      redirectUrl: authUrl 
    });
  } catch (error) {
    console.error('Link provider error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate provider linking' 
    });
  }
});

// Unlink provider from account
router.delete('/unlink/:provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Check if user has multiple providers
    if (user.providers.length <= 1) {
      return res.status(400).json({ 
        error: 'Cannot unlink the only authentication method' 
      });
    }

    // Remove provider
    user.providers = user.providers.filter(p => p.provider !== provider);
    await user.save();

    res.json({ 
      success: true, 
      message: `${provider} account unlinked successfully`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Unlink provider error:', error);
    res.status(500).json({ 
      error: 'Failed to unlink provider' 
    });
  }
});

// Get available providers
router.get('/providers', (req, res) => {
  res.json({
    success: true,
    providers: [
      {
        name: 'google',
        displayName: 'Google',
        authUrl: '/api/auth/google',
        enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
      },
      {
        name: 'github',
        displayName: 'GitHub',
        authUrl: '/api/auth/github',
        enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
      },
      {
        name: 'azure',
        displayName: 'Microsoft',
        authUrl: '/api/auth/azure',
        enabled: !!(process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID)
      }
    ]
  });
});

module.exports = router;