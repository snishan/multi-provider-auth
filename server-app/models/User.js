const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  password: {
    type: String,
    default: null // For social login users
  },
  providers: [{
    provider: {
      type: String,
      enum: ['google', 'github', 'azure', 'local'],
      required: true
    },
    providerId: {
      type: String,
      required: true
    },
    providerData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving (for local auth)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user has a specific provider
userSchema.methods.hasProvider = function(provider) {
  return this.providers.some(p => p.provider === provider);
};

// Add or update provider
userSchema.methods.addProvider = function(provider, providerId, providerData = {}) {
  const existingProvider = this.providers.find(p => p.provider === provider);
  
  if (existingProvider) {
    existingProvider.providerId = providerId;
    existingProvider.providerData = providerData;
  } else {
    this.providers.push({
      provider,
      providerId,
      providerData
    });
  }
};

// Get user's public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    avatar: this.avatar,
    providers: this.providers.map(p => p.provider),
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'providers.provider': 1, 'providers.providerId': 1 });

module.exports = mongoose.model('User', userSchema);