# ✨ Study Sanctuary - Pomodoro Study Tracker

A whimsical, Studio Ghibli-inspired Pomodoro study tracking application built with the MERN stack.

## 🌟 Features

- **🍅 Pomodoro Timer** - Customizable work and break intervals with audio notifications
- **📝 Session Logging** - Track what you study with topics and productivity ratings
- **🎨 Subject Management** - Create colorful custom labels for your subjects
- **📊 Dashboard** - Beautiful charts visualizing your study trends
- **📚 Session History** - View and filter all your past study sessions
- **⚙️ Settings** - Customize timer durations and preferences
- **✨ Whimsical UI** - Studio Ghibli-inspired design with paper-like textures

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anv10/study-sanctuary-pomodoro-app.git
   cd study-sanctuary-pomodoro-app
   ```

2. **Install dependencies**
   ```bash
   # Install both backend and frontend dependencies at once
   npm run install-all
   
   # Or manually:
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/pomodoro-study-tracker
   NODE_ENV=development
   ```
   
   > **Note:** The `.env` file is not included in the repository for security. You need to create it yourself.

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # Or manually
   mongod
   ```

5. **Run the application**
   
   ```bash
   # From the root directory, run both server and client
   npm run dev
   ```
   
   Or run them separately:
   ```bash
   # Terminal 1 - Backend (from root)
   npm run server
   
   # Terminal 2 - Frontend (from root)
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api

## 📁 Project Structure

```
pomodoro-app/
├── server/
│   ├── models/          # MongoDB models
│   │   ├── Subject.js
│   │   ├── Session.js
│   │   └── Settings.js
│   ├── routes/          # API routes
│   │   ├── subjects.js
│   │   ├── sessions.js
│   │   └── settings.js
│   └── server.js        # Express server setup
├── client/
│   ├── public/
│   └── src/
│       ├── components/  # React components
│       │   ├── Timer.js
│       │   ├── Dashboard.js
│       │   ├── SessionHistory.js
│       │   ├── SubjectManager.js
│       │   └── Settings.js
│       ├── App.js
│       ├── App.css
│       └── index.css
├── package.json
└── .env
```

## 🎨 Design Features

- **Typography**: Playfair Display for headings, Quicksand for body text
- **Color Palette**: Warm off-whites, soft pinks, gentle greens, and golden yellows
- **Paper Effect**: Subtle textures and shadows for a handcrafted feel
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Works beautifully on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📊 API Endpoints

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create a new subject
- `PUT /api/subjects/:id` - Update a subject
- `DELETE /api/subjects/:id` - Delete a subject

### Sessions
- `GET /api/sessions` - Get all sessions (with filtering)
- `POST /api/sessions` - Create a new session
- `PUT /api/sessions/:id` - Update a session
- `DELETE /api/sessions/:id` - Delete a session
- `GET /api/sessions/stats/weekly` - Get weekly statistics
- `GET /api/sessions/stats/today` - Get today's statistics

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## 🎯 Usage Tips

1. **Create Subjects First** - Set up your subjects with custom colors in the Subjects tab
2. **Customize Timer** - Adjust your Pomodoro durations in Settings to match your study style
3. **Log Sessions** - After completing a work session, log what you studied and rate your productivity
4. **Track Progress** - Check the Dashboard to see your study trends and patterns
5. **Review History** - Use filters in the History tab to find specific study sessions

## 🌸 Studio Ghibli Inspiration

The design draws inspiration from Studio Ghibli's aesthetic:
- Warm, comforting color palette
- Hand-drawn, organic shapes
- Whimsical icons and emojis
- Paper-like textures
- Gentle animations

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Made with ✨ and 🍅
