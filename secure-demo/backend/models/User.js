// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/crypto');

const SALT_ROUNDS = 10;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: function(){ return !this.googleId }, unique: false }, // demo: not unique if encrypted in some flows
  password: { type: String }, // for local accounts (bcrypt hash)
  name: { type: String },     // we will encrypt this field
  googleId: { type: String, unique: true, sparse: true }
});

// Hash password before save (only if modified)
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
  }
  // Encrypt name if modified and not already hex-like
  if (this.isModified('name') && this.name && !/^[0-9a-f]+$/.test(this.name)) {
    this.name = encrypt(this.name);
  }
  next();
});

// instance method: compare password
UserSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

// helper to get decrypted object for response
UserSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    email: this.email, // if you encrypted email, decrypt here
    name: this.name ? decrypt(this.name) : '',
    googleId: this.googleId || null
  };
};

module.exports = mongoose.model('User', UserSchema);
