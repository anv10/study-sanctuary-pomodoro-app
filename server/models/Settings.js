const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  workDuration: {
    type: Number,
    default: 25 // minutes
  },
  shortBreakDuration: {
    type: Number,
    default: 5 // minutes
  },
  longBreakDuration: {
    type: Number,
    default: 15 // minutes
  },
  sessionsBeforeLongBreak: {
    type: Number,
    default: 4
  },
  soundEnabled: {
    type: Boolean,
    default: true
  },
  soundVolume: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
