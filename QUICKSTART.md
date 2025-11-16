# 🚀 Quick Start Guide

Your **Study Sanctuary** Pomodoro app is now ready to use!

## ✅ What's Running

- ✨ **Backend Server**: Running on http://localhost:5001
- 🎨 **Frontend App**: Running on http://localhost:3000
- 📊 **MongoDB**: Connected and ready

## 🎯 How to Use Your App

### 1. Create Your First Subject (🎨 Subjects Tab)
- Click on the "🎨 Subjects" tab
- Click "+ Add New Subject"
- Enter a subject name (e.g., "Mathematics", "History", "Programming")
- Choose a fun color from the palette or use the color picker
- Click "✨ Create Subject"

### 2. Start Your First Study Session (🍅 Timer Tab)
- Go to the "🍅 Timer" tab
- You'll see the beautiful circular timer (default: 25 minutes)
- Click "▶️ Start" to begin your Pomodoro session
- Stay focused while the timer counts down!
- When the timer completes, you'll hear a notification sound

### 3. Log Your Session
- After completing a session, a form will appear
- Select the subject you studied
- Enter the specific topic (e.g., "Calculus - Integration")
- Rate your productivity by clicking the stars (1-5 ⭐)
- Your session is now saved!

### 4. View Your Progress (📊 Dashboard Tab)
- See today's study time and session count
- View beautiful charts showing:
  - Daily study time (bar chart)
  - Study distribution by subject (pie chart)
  - Session trends over the week (line chart)
  - Sessions by subject (horizontal bar chart)

### 5. Review Your History (📚 History Tab)
- See all your completed study sessions
- Filter by subject or minimum rating
- Each session card shows:
  - Subject with its color
  - Topic studied
  - Duration
  - Productivity rating
  - Date and time

### 6. Customize Settings (⚙️ Settings Tab)
- Adjust work duration (default: 25 min)
- Change short break (default: 5 min)
- Change long break (default: 15 min)
- Set sessions before long break (default: 4)
- Enable/disable notification sounds
- Adjust sound volume
- See a visual preview of your timer schedule

## 🎨 Design Features You'll Love

- **Whimsical Fonts**: Playfair Display headings + Quicksand body text
- **Paper Texture**: Subtle grain effect on cards
- **Warm Colors**: Off-white backgrounds (#FEFAF0), pink accents (#FF6B9D)
- **Smooth Animations**: Hover effects and transitions
- **Responsive**: Works beautifully on any screen size

## 🍅 Pomodoro Technique Tips

1. **Work in focused 25-minute blocks** (customizable)
2. **Take short 5-minute breaks** between sessions
3. **Take a longer 15-minute break** after 4 sessions
4. **Minimize distractions** during work sessions
5. **Rate your productivity** to track improvements
6. **Review your stats** to identify patterns

## 🔥 Pro Tips

- **Create color-coded subjects** for easy visual identification
- **Use specific topic names** to track detailed progress
- **Rate honestly** - it helps identify when you're most productive
- **Check the dashboard regularly** to stay motivated
- **Adjust timer durations** to match your optimal focus time

## 🛠️ Troubleshooting

### Port Already in Use?
If you see "EADDRINUSE" error:
```bash
# Kill the process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9
```

### MongoDB Not Running?
```bash
# Start MongoDB
brew services start mongodb-community

# Or manually
mongod
```

### Need to Restart Everything?
```bash
# Stop both servers (Ctrl+C in both terminal windows)

# Then restart
npm run dev
```

## 📱 Access Your App

- **Local**: http://localhost:3000
- **On Your Network**: http://192.168.122.237:3000 (access from phone/tablet)

## 🎉 Enjoy Your Study Sessions!

You're all set! Start tracking your study sessions and watch your productivity soar with beautiful visualizations. 

Happy studying! ✨📚🍅

---

Need help? Check the README.md for more detailed information.
