import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';

const Timer = ({ subjects, addSubject, addSession, settings }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [lastPauseTime, setLastPauseTime] = useState(null);
  
  // Session form - filled before starting timer
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [tasks, setTasks] = useState([]); // { id, text, completed }
  const [newTaskText, setNewTaskText] = useState('');
  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#FF6B9D');
  
  // Rating popup state
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [pendingRating, setPendingRating] = useState(3);
  
  const audioRef = useRef(null);

  // Update timer duration when mode changes
  useEffect(() => {
    if (settings && !isActive) {
      const duration = mode === 'work' 
        ? settings.workDuration 
        : mode === 'shortBreak' 
        ? settings.shortBreakDuration 
        : settings.longBreakDuration;
      setTimeLeft(duration * 60);
    }
  }, [settings, mode, isActive]);

  // Auto-save session and transition to next mode
  const handleTimerComplete = React.useCallback(async () => {
    // Play notification sound with error handling
    if (settings && settings.soundEnabled && audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.log('Audio playback failed (browser autoplay policy):', error.message);
        // Silently fail - this is expected on first load without user interaction
      }
    }

    if (mode === 'work') {
      // Don't auto-save here - let user rate when they click Stop
      const newCompletedCount = completedSessions + 1;
      setCompletedSessions(newCompletedCount);
      
      // Determine next break type
      if (settings && newCompletedCount % settings.sessionsBeforeLongBreak === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      // Break is over, start work session automatically
      setMode('work');
    }

    // Continue the timer automatically for the next phase
    const nextDuration = mode === 'work' 
      ? (settings && completedSessions + 1 >= settings.sessionsBeforeLongBreak && (completedSessions + 1) % settings.sessionsBeforeLongBreak === 0
          ? settings.longBreakDuration 
          : settings?.shortBreakDuration || 5)
      : (settings?.workDuration || 25);
    
    setTimeLeft(nextDuration * 60);
    // Timer continues automatically
  }, [mode, completedSessions, settings]);

  // Timer countdown effect
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleTimerComplete]);

  const startTimer = () => {
    if (!selectedSubject || !topic.trim()) {
      alert('Please select a subject and enter a topic before starting!');
      return;
    }
    setIsActive(true);
    setSessionInProgress(true);
    if (!studyStartTime) {
      setStudyStartTime(Date.now());
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    setLastPauseTime(Date.now());
  };

  const resumeTimer = () => {
    setIsActive(true);
    if (lastPauseTime) {
      setTotalPausedTime(prev => prev + (Date.now() - lastPauseTime));
      setLastPauseTime(null);
    }
  };

  const stopAndRate = () => {
    // Show rating popup if there were completed work sessions
    if (completedSessions > 0) {
      setIsActive(false);
      setShowRatingPopup(true);
    } else {
      // No sessions to rate, just reset
      resetTimer();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSessionInProgress(false);
    setCompletedSessions(0);
    setMode('work');
    setStudyStartTime(null);
    setTotalPausedTime(0);
    setLastPauseTime(null);
    setTasks([]);
    setNewTaskText('');
    const duration = settings?.workDuration || 25;
    setTimeLeft(duration * 60);
  };

  const handleRatingSubmit = async () => {
    // Save one study cycle with total time
    if (selectedSubject && topic.trim() && completedSessions > 0 && studyStartTime) {
      // Calculate total time from start to stop (including breaks and pauses)
      const totalTimeMs = Date.now() - studyStartTime - totalPausedTime;
      const totalMinutes = Math.round(totalTimeMs / 60000);

      // Auto-calculate productivity rating if tasks are defined
      let calculatedRating = pendingRating;
      if (tasks.length > 0) {
        const completedCount = tasks.filter(t => t.completed).length;
        const ratio = tasks.length > 0 ? completedCount / tasks.length : 0;
        calculatedRating = Math.max(1, Math.round(ratio * 5));
      }
      
      try {
        await addSession({
          subject: selectedSubject,
          topic: topic.trim(),
          duration: totalMinutes,
          workSessions: completedSessions,
          productivityRating: calculatedRating,
          tasks: tasks.map(t => ({ description: t.text, completed: t.completed })),
          notes: ''
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
    
    // Close popup and reset
    setShowRatingPopup(false);
    setPendingRating(3);
    resetTimer();
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTasks(prev => [
      ...prev,
      { id: Date.now().toString(), text: newTaskText.trim(), completed: false }
    ]);
    setNewTaskText('');
  };

  const toggleTaskCompletion = (id) => {
    setTasks(prev => prev.map(task => (
      task.id === id ? { ...task, completed: !task.completed } : task
    )));
  };

  const handleRatingCancel = () => {
    setShowRatingPopup(false);
    setPendingRating(3);
    resetTimer();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddNewSubject = async () => {
    if (newSubjectName.trim()) {
      try {
        const newSubject = await addSubject({
          name: newSubjectName,
          color: newSubjectColor
        });
        setSelectedSubject(newSubject._id);
        setNewSubjectName('');
        setShowNewSubjectForm(false);
      } catch (error) {
        alert('Error adding subject');
      }
    }
  };

  const progressPercentage = settings
    ? ((settings[mode === 'work' ? 'workDuration' : mode === 'shortBreak' ? 'shortBreakDuration' : 'longBreakDuration'] * 60 - timeLeft) / 
       (settings[mode === 'work' ? 'workDuration' : mode === 'shortBreak' ? 'shortBreakDuration' : 'longBreakDuration'] * 60)) * 100
    : 0;

  return (
    <div className="timer-container">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />
      
      <div className="paper-card timer-card">
        <div className="mode-indicator">
          <h3 className="current-mode">
            {mode === 'work' && <><span className="material-icons">work</span> Work Session</>}
            {mode === 'shortBreak' && <><span className="material-icons">coffee</span> Short Break</>}
            {mode === 'longBreak' && <><span className="material-icons">spa</span> Long Break</>}
          </h3>
        </div>

        <div className="timer-display">
          <div className="timer-circle" style={{
            background: `conic-gradient(#FF6B9D ${progressPercentage}%, #F5E6D3 ${progressPercentage}%)`
          }}>
            <div className="timer-inner">
              <h2 className="time-text">{formatTime(timeLeft)}</h2>
            </div>
          </div>
        </div>

        <div className="timer-info">
          <p className="sessions-count">Work sessions completed: {completedSessions}</p>
        </div>

        <div className="timer-controls">
          {!sessionInProgress ? (
            <button 
              className="btn btn-primary" 
              onClick={startTimer}
              disabled={!selectedSubject || !topic.trim()}
            >
              <span className="material-icons">play_arrow</span>
              <span>Start Session</span>
            </button>
          ) : (
            <>
              <button 
                className={`btn ${isActive ? 'btn-warning' : 'btn-primary'}`} 
                onClick={isActive ? pauseTimer : resumeTimer}
              >
                <span className="material-icons">{isActive ? 'pause' : 'play_arrow'}</span>
                <span>{isActive ? 'Pause' : 'Resume'}</span>
              </button>
              <button className="btn btn-danger" onClick={stopAndRate}>
                <span className="material-icons">stop</span>
                <span>Stop & Reset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!sessionInProgress && (
        <div className="paper-card session-form">
          <h3 className="section-title">Setup Your Study Session</h3>
          
          <div className="form-group">
            <label>Subject</label>
            {!showNewSubjectForm ? (
              <div className="subject-selector">
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowNewSubjectForm(true)}
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
                  <span>Add New Subject</span>
                </button>
              </div>
            ) : (
              <div className="new-subject-form">
                <input
                  type="text"
                  placeholder="Subject name (e.g., Mathematics)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                />
                <div className="color-picker-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={newSubjectColor}
                    onChange={(e) => setNewSubjectColor(e.target.value)}
                    className="color-picker"
                  />
                </div>
                <div className="button-group">
                  <button className="btn btn-primary" onClick={handleAddNewSubject}>
                    Save Subject
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowNewSubjectForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {!showNewSubjectForm && (
            <>
              <div className="form-group">
                <label>Topic</label>
                <input
                  type="text"
                  placeholder="What did you study? (e.g., Calculus - Integration)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tasks for this session (mini todos)</label>
                <div className="task-input-row">
                  <input
                    type="text"
                    placeholder="e.g., Solve 5 problems, Review notes"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTask();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleAddTask}
                  >
                    <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
                    <span>Add Task</span>
                  </button>
                </div>

                {tasks.length > 0 && (
                  <ul className="task-list">
                    {tasks.map(task => (
                      <li key={task.id} className={task.completed ? 'task-completed' : ''}>
                        <label>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompletion(task.id)}
                          />
                          <span>{task.text}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="ready-message">
                <p>Ready to start? Click "Start Session" above once you've entered your subject and topic.</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Rating Popup */}
      {showRatingPopup && (
        <div className="modal-overlay">
          <div className="modal-content paper-card">
            <h3 className="section-title">Rate Your Productivity</h3>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
              You completed {completedSessions} work session{completedSessions > 1 ? 's' : ''}!
            </p>
            {tasks.length > 0 && (
              <p style={{ textAlign: 'center', marginBottom: '10px', color: '#8B7765' }}>
                Tasks completed: {tasks.filter(t => t.completed).length} / {tasks.length}
              </p>
            )}
            
            <div className="rating-selector">
              <p style={{ marginBottom: '15px', textAlign: 'center' }}>
                Productivity is calculated automatically based on how many tasks you completed
                ({tasks.filter(t => t.completed).length}/{tasks.length || 1}).
              </p>
            </div>

            <div className="button-group" style={{ marginTop: '30px' }}>
              <button className="btn btn-primary" onClick={handleRatingSubmit}>
                Save Session
              </button>
              <button className="btn btn-secondary" onClick={handleRatingCancel}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
