const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get settings (creates default if none exist)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    if (req.body.workDuration !== undefined) settings.workDuration = req.body.workDuration;
    if (req.body.shortBreakDuration !== undefined) settings.shortBreakDuration = req.body.shortBreakDuration;
    if (req.body.longBreakDuration !== undefined) settings.longBreakDuration = req.body.longBreakDuration;
    if (req.body.sessionsBeforeLongBreak !== undefined) settings.sessionsBeforeLongBreak = req.body.sessionsBeforeLongBreak;
    if (req.body.soundEnabled !== undefined) settings.soundEnabled = req.body.soundEnabled;
    if (req.body.soundVolume !== undefined) settings.soundVolume = req.body.soundVolume;

    settings.updatedAt = Date.now();
    
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
