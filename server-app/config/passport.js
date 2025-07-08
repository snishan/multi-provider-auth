const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const AzureStrategy = require('passport-azure-ad').OIDCStrategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    
    // Check if user exists with this Google ID
    let user = await User.findOne({
      'providers.provider': 'google',
      'providers.providerId': profile.id
    });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Add Google provider to existing user
      user.addProvider('google', profile.id, {
        accessToken,
        refreshToken,
        profile: profile._json
      });
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0]?.value,
      isEmailVerified: true, // Google emails are verified
      providers: [{
        provider: 'google',
        providerId: profile.id,
        providerData: {
          accessToken,
          refreshToken,
          profile: profile._json
        }
      }]
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    
    // Check if user exists with this GitHub ID
    let user = await User.findOne({
      'providers.provider': 'github',
      'providers.providerId': profile.id
    });

    if (user) {
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Check if user exists with same email
    const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
    user = await User.findOne({ email });
    
    if (user) {
      user.addProvider('github', profile.id, {
        accessToken,
        refreshToken,
        profile: profile._json
      });
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      email,
      name: profile.displayName || profile.username,
      avatar: profile.photos[0]?.value,
      isEmailVerified: !!profile.emails?.[0]?.value,
      providers: [{
        provider: 'github',
        providerId: profile.id,
        providerData: {
          accessToken,
          refreshToken,
          profile: profile._json
        }
      }]
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Azure AD OAuth Strategy
passport.use(new AzureStrategy({
  identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  responseType: 'code',
  responseMode: 'query',
  redirectUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/azure/callback`,
  allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
  scope: ['profile', 'offline_access', 'https://graph.microsoft.com/mail.read']
}, async (iss, sub, profile, accessToken, refreshToken, done) => {
  try {
    
    // Check if user exists with this Azure ID
    let user = await User.findOne({
      'providers.provider': 'azure',
      'providers.providerId': profile.oid
    });

    if (user) {
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.upn || profile.email });
    
    if (user) {
      user.addProvider('azure', profile.oid, {
        accessToken,
        refreshToken,
        profile
      });
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      email: profile.upn || profile.email,
      name: profile.displayName || profile.name,
      avatar: null, // Azure doesn't provide avatar in basic profile
      isEmailVerified: true, // Azure emails are verified
      providers: [{
        provider: 'azure',
        providerId: profile.oid,
        providerData: {
          accessToken,
          refreshToken,
          profile
        }
      }]
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

module.exports = passport;