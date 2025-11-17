import React, { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './SubjectManager.css';

const SubjectManager = ({ subjects, addSubject, updateSubject, deleteSubject }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#FF6B9D'
  });

  const presetColors = [
    '#FF6B9D', '#FFB3CC', '#A8E6CF', '#C1F0DB',
    '#FFD93D', '#FFE66D', '#FF6B6B', '#FFA8A8',
    '#95E1D3', '#38D9A9', '#A29BFE', '#DDA0FF',
    '#FDCB6E', '#FFEAA7', '#74B9FF', '#A29BFE'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a subject name');
      return;
    }

    try {
      if (editingId) {
        await updateSubject(editingId, formData);
        setEditingId(null);
      } else {
        await addSubject(formData);
      }
      
      setFormData({ name: '', color: '#FF6B9D' });
      setShowForm(false);
    } catch (error) {
      alert('Error saving subject');
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      name: subject.name,
      color: subject.color
    });
    setEditingId(subject._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      await deleteSubject(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', color: '#FF6B9D' });
  };

  return (
    <div className="subject-manager-container">
      <h2 className="section-title">Subject Manager</h2>

      {!showForm && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(true)}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
            <span>Add New Subject</span>
          </button>
        </div>
      )}

      {showForm && (
        <div className="paper-card form-card">
          <h3 style={{ color: '#FF6B9D', marginBottom: '20px' }}>
            {editingId ? 'Edit Subject' : 'Create New Subject'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subject Name</label>
              <input
                type="text"
                placeholder="e.g., Mathematics, History, Programming..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Choose a Color</label>
              <div className="color-grid">
                {presetColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="color-picker-custom"
              />
            </div>

            <div className="form-preview">
              <div 
                className="preview-badge"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name || 'Subject Name'}
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save Changes' : 'Create Subject'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subjects List */}
      {subjects.length > 0 ? (
        <div className="subjects-grid">
          {subjects.map(subject => (
            <div key={subject._id} className="paper-card subject-card">
              <div 
                className="subject-color-bar"
                style={{ backgroundColor: subject.color }}
              />
              <div className="subject-content">
                <h3 className="subject-name">{subject.name}</h3>
                <div className="subject-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(subject)}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(subject._id)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="paper-card empty-state">
          <span className="material-icons empty-state-icon">label</span>
          <p className="empty-state-text">No subjects yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;
