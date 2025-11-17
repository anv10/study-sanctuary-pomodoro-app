import React, { useState } from 'react';
import './SessionHistory.css';

const SessionHistory = ({ sessions, subjects, deleteSession }) => {
  const [filterSubject, setFilterSubject] = useState('');
  const [filterRating, setFilterRating] = useState('');

  const filteredSessions = sessions.filter(session => {
    if (filterSubject && session.subject._id !== filterSubject) return false;
    if (filterRating && session.productivityRating < parseInt(filterRating)) return false;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this study session?')) {
      await deleteSession(sessionId);
    }
  };

  return (
    <div className="history-container">
      <h2 className="section-title">Study History</h2>

      {/* Filters */}
      <div className="paper-card filters-card">
        <div className="form-row">
          <div className="form-group">
            <label>Filter by Subject</label>
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Minimum Rating</label>
            <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
              <option value="">All Ratings</option>
              <option value="1">★ and above</option>
              <option value="2">★★ and above</option>
              <option value="3">★★★ and above</option>
              <option value="4">★★★★ and above</option>
              <option value="5">★★★★★</option>
            </select>
          </div>
        </div>
      </div>

      {/* Session List */}
      {filteredSessions.length > 0 ? (
        <div className="sessions-grid">
          {filteredSessions.map((session) => (
            <div key={session._id} className="paper-card session-card">
              <button 
                className="delete-btn"
                onClick={() => handleDelete(session._id)}
                title="Delete session"
              >
                <span className="material-icons">delete</span>
              </button>

              <div 
                className="subject-badge" 
                style={{ backgroundColor: session.subject.color }}
              >
                {session.subject.name}
              </div>
              
              <h3 className="session-topic">{session.topic}</h3>
              
              <div className="session-details">
                <div className="detail-item">
                  <span className="material-icons detail-icon">calendar_today</span>
                  <span>{formatDate(session.completedAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="material-icons detail-icon">work_history</span>
                  <span>{session.workSessions || 1} session{(session.workSessions || 1) > 1 ? 's' : ''}</span>
                </div>
                <div className="detail-item">
                  <span className="material-icons detail-icon">schedule</span>
                  <span>{session.duration} min total</span>
                </div>
                <div className="detail-item">
                  <span className="material-icons detail-icon">star</span>
                  <span>{session.productivityRating}/5</span>
                </div>
              </div>
              {session.tasks && session.tasks.length > 0 && (
                <div className="session-tasks">
                  <strong>Tasks:</strong>
                  <ul>
                    {session.tasks.map((task, index) => (
                      <li key={index} className={task.completed ? 'task-completed' : ''}>
                        {task.completed ? '✅ ' : '⬜ '}{task.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {session.notes && (
                <div className="session-notes">
                  <strong>Notes:</strong> {session.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="paper-card empty-state">
          <span className="material-icons empty-state-icon">menu_book</span>
          <p className="empty-state-text">
            {sessions.length === 0 
              ? "No study sessions yet. Start your first Pomodoro session!" 
              : "No sessions match your filters."}
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
