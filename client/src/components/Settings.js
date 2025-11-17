import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ settings, updateSettings }) => {
  const [formData, setFormData] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    soundEnabled: true,
    soundVolume: 50
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(formData);
    alert('Settings saved successfully! ✨');
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="settings-container">
      <h2 className="section-title">Settings</h2>

      <div className="paper-card settings-card">
        <form onSubmit={handleSubmit}>
          {/* Timer Durations */}
          <div className="settings-section">
            <h3 className="settings-section-title">Timer Durations</h3>
            
            <div className="form-group">
              <label>Work Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.workDuration}
                onChange={(e) => handleChange('workDuration', parseInt(e.target.value))}
              />
              <p className="help-text">Recommended: 25 minutes</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Short Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.shortBreakDuration}
                  onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value))}
                />
                <p className="help-text">Recommended: 5 minutes</p>
              </div>

              <div className="form-group">
                <label>Long Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.longBreakDuration}
                  onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value))}
                />
                <p className="help-text">Recommended: 15 minutes</p>
              </div>
            </div>

            <div className="form-group">
              <label>Sessions Before Long Break</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.sessionsBeforeLongBreak}
                onChange={(e) => handleChange('sessionsBeforeLongBreak', parseInt(e.target.value))}
              />
              <p className="help-text">Recommended: 4 sessions</p>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="settings-section">
            <h3 className="settings-section-title">Sound Settings</h3>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.soundEnabled}
                  onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                  className="checkbox"
                />
                <span>Enable notification sounds</span>
              </label>
            </div>

            {formData.soundEnabled && (
              <div className="form-group">
                <label>Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.soundVolume}
                  onChange={(e) => handleChange('soundVolume', parseInt(e.target.value))}
                  className="volume-slider"
                />
                <div className="volume-display">{formData.soundVolume}%</div>
              </div>
            )}
          </div>

          {/* Timer Preview */}
          <div className="settings-section">
            <h3 className="settings-section-title">Your Timer Schedule</h3>
            <div className="schedule-preview">
              {[...Array(formData.sessionsBeforeLongBreak)].map((_, index) => (
                <React.Fragment key={index}>
                  <div className="schedule-item work">
                    Work<br/>
                    <span>{formData.workDuration} min</span>
                  </div>
                  <div className="schedule-arrow">→</div>
                  <div className={`schedule-item ${index === formData.sessionsBeforeLongBreak - 1 ? 'long-break' : 'short-break'}`}>
                    {index === formData.sessionsBeforeLongBreak - 1 ? 'Long Break' : 'Break'}
                    <br/>
                    <span>
                      {index === formData.sessionsBeforeLongBreak - 1 
                        ? formData.longBreakDuration 
                        : formData.shortBreakDuration} min
                    </span>
                  </div>
                  {index < formData.sessionsBeforeLongBreak - 1 && <div className="schedule-arrow">→</div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
