import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const API_URL = 'http://localhost:5001/api';

const Dashboard = () => {
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [todayStats, setTodayStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [weekly, today] = await Promise.all([
        axios.get(`${API_URL}/sessions/stats/weekly`),
        axios.get(`${API_URL}/sessions/stats/today`)
      ]);
      setWeeklyStats(weekly.data);
      setTodayStats(today.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!weeklyStats || !todayStats) {
    return (
      <div className="paper-card">
        <p style={{ textAlign: 'center' }}>Loading statistics...</p>
      </div>
    );
  }

  // Prepare data for charts
  const dailyData = Object.entries(weeklyStats.dailyStats).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    minutes: data.minutes,
    sessions: data.sessions
  })).reverse();

  const subjectData = Object.entries(weeklyStats.subjectStats).map(([name, data]) => ({
    name,
    minutes: data.minutes,
    sessions: data.sessions,
    color: data.color
  }));

  const COLORS = subjectData.map(s => s.color);

  return (
    <div className="dashboard-container">
      <h2 className="section-title">Your Study Dashboard</h2>

      {/* Today's Stats */}
      <div className="paper-card">
        <h3 style={{ textAlign: 'center', color: '#FF6B9D', marginBottom: '20px' }}>Today's Progress</h3>
        <div className="grid grid-3">
          <div className="stat-card">
            <span className="stat-value">{todayStats.totalSessions}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{todayStats.totalMinutes}</span>
            <span className="stat-label">Minutes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{(todayStats.totalMinutes / 60).toFixed(1)}</span>
            <span className="stat-label">Hours</span>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="paper-card">
        <h3 style={{ textAlign: 'center', color: '#FF6B9D', marginBottom: '20px' }}>This Week</h3>
        <div className="grid grid-3">
          <div className="stat-card">
            <span className="stat-value">{weeklyStats.totalSessions}</span>
            <span className="stat-label">Total Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{(weeklyStats.totalMinutes / 60).toFixed(1)}</span>
            <span className="stat-label">Total Hours</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {weeklyStats.avgRating.toFixed(1)} 
              <span className="material-icons" style={{ fontSize: '24px', color: '#FFD93D', verticalAlign: 'middle', marginLeft: '5px' }}>star</span>
            </span>
            <span className="stat-label">Avg Productivity</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      {dailyData.length > 0 && (
        <div className="grid grid-2">
          {/* Daily Study Time Chart */}
          <div className="paper-card chart-card">
            <h3 style={{ color: '#FF6B9D', marginBottom: '20px' }}>Daily Study Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D2B48C" opacity={0.3} />
                <XAxis dataKey="date" stroke="#8B7765" />
                <YAxis stroke="#8B7765" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#FEFAF0', 
                    border: '2px solid #D2B48C', 
                    borderRadius: '10px' 
                  }} 
                />
                <Legend />
                <Bar dataKey="minutes" fill="#FF6B9D" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Study by Subject Chart */}
          <div className="paper-card chart-card">
            <h3 style={{ color: '#FF6B9D', marginBottom: '20px' }}>Study by Subject</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="minutes"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#FEFAF0', 
                    border: '2px solid #D2B48C', 
                    borderRadius: '10px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Session Count Chart */}
          <div className="paper-card chart-card">
            <h3 style={{ color: '#FF6B9D', marginBottom: '20px' }}>Session Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D2B48C" opacity={0.3} />
                <XAxis dataKey="date" stroke="#8B7765" />
                <YAxis stroke="#8B7765" label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#FEFAF0', 
                    border: '2px solid #D2B48C', 
                    borderRadius: '10px' 
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#A8E6CF" 
                  strokeWidth={3}
                  dot={{ fill: '#A8E6CF', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Session Count */}
          {subjectData.length > 0 && (
            <div className="paper-card chart-card">
              <h3 style={{ color: '#FF6B9D', marginBottom: '20px' }}>Sessions by Subject</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#D2B48C" opacity={0.3} />
                  <XAxis type="number" stroke="#8B7765" />
                  <YAxis dataKey="name" type="category" stroke="#8B7765" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#FEFAF0', 
                      border: '2px solid #D2B48C', 
                      borderRadius: '10px' 
                    }} 
                  />
                  <Bar dataKey="sessions" radius={[0, 10, 10, 0]}>
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {dailyData.length === 0 && (
        <div className="paper-card empty-state">
          <span className="material-icons empty-state-icon">insert_chart</span>
          <p className="empty-state-text">Start studying to see your progress charts!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
