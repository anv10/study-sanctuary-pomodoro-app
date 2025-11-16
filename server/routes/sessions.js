const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// Get all sessions with optional filtering
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, subject, minRating } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    if (subject) query.subject = subject;
    if (minRating) query.productivityRating = { $gte: parseInt(minRating) };

    const sessions = await Session.find(query)
      .populate('subject')
      .sort({ completedAt: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly statistics
router.get('/stats/weekly', async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await Session.find({
      completedAt: { $gte: weekAgo }
    }).populate('subject');

    // Calculate stats
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalWorkSessions = sessions.reduce((sum, s) => sum + (s.workSessions || 1), 0);
    const avgRating = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.productivityRating, 0) / sessions.length 
      : 0;

    // Group by day
    const dailyStats = {};
    sessions.forEach(session => {
      const day = session.completedAt.toISOString().split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { minutes: 0, sessions: 0 };
      }
      dailyStats[day].minutes += session.duration;
      dailyStats[day].sessions += (session.workSessions || 1);
    });

    // Group by subject
    const subjectStats = {};
    sessions.forEach(session => {
      const subjectName = session.subject.name;
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { 
          minutes: 0, 
          sessions: 0,
          color: session.subject.color 
        };
      }
      subjectStats[subjectName].minutes += session.duration;
      subjectStats[subjectName].sessions += (session.workSessions || 1);
    });

    res.json({
      totalSessions: totalWorkSessions,
      totalMinutes,
      avgRating: Math.round(avgRating * 10) / 10,
      dailyStats,
      subjectStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's stats
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await Session.find({
      completedAt: { $gte: today, $lt: tomorrow }
    }).populate('subject');

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalWorkSessions = sessions.reduce((sum, s) => sum + (s.workSessions || 1), 0);

    res.json({
      totalSessions: totalWorkSessions,
      totalMinutes,
      sessions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new session
router.post('/', async (req, res) => {
  const session = new Session({
    subject: req.body.subject,
    topic: req.body.topic,
    duration: req.body.duration,
    workSessions: req.body.workSessions || 1,
    productivityRating: req.body.productivityRating,
    notes: req.body.notes,
    completedAt: req.body.completedAt || new Date()
  });

  try {
    const newSession = await session.save();
    const populatedSession = await Session.findById(newSession._id).populate('subject');
    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a session
router.put('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (req.body.subject) session.subject = req.body.subject;
    if (req.body.topic) session.topic = req.body.topic;
    if (req.body.duration) session.duration = req.body.duration;
    if (req.body.productivityRating) session.productivityRating = req.body.productivityRating;
    if (req.body.notes !== undefined) session.notes = req.body.notes;

    const updatedSession = await session.save();
    const populatedSession = await Session.findById(updatedSession._id).populate('subject');
    res.json(populatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a session
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
