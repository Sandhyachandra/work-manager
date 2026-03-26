const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  skills: [String],
  capacity: { type: Number, default: 100 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);