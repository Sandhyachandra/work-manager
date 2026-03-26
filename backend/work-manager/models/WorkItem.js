const mongoose = require('mongoose');

const dependencySchema = new mongoose.Schema({
  workItem: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkItem' },
  type: { type: String, enum: ['full', 'partial'] },
  percentageRequired: { type: Number, default: 100 }
});

const workItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'in-progress', 'blocked', 'completed'], default: 'pending' },
  dependencies: [dependencySchema],
  blockedReason: String
}, { timestamps: true });

module.exports = mongoose.model('WorkItem', workItemSchema);