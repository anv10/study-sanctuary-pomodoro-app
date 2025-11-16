# Study Sanctuary – Review Notes

These notes are written for explaining the project in a review, assuming only basic web knowledge.

---

## 1. What this project is

Study Sanctuary is a Pomodoro-based study tracker.

- **Goal**: Help you study in focused blocks (Pomodoros), log what you studied, and visualize your progress.
- **Tech stack**:
  - **Frontend**: React (JavaScript) – runs in the browser at `http://localhost:3000`
  - **Backend**: Node.js + Express – REST API at `http://localhost:5001/api`
  - **Database**: MongoDB – stores subjects, study sessions, and settings

High-level description you can say:

> “The frontend React app lets the user run a Pomodoro timer, choose a subject, log sessions, and view dashboards. The backend Express API stores all data in MongoDB. The frontend talks to the backend using HTTP requests via Axios.”

---

## 2. Frontend overview (React)

Main files:

- `client/src/App.js` – main React component, holds global state and navigation
- Components under `client/src/components/`:
  - `Timer.js` – Pomodoro timer + session logging
  - `Dashboard.js` – charts and statistics
  - `SessionHistory.js` – list and filter past sessions
  - `SubjectManager.js` – manage subjects
  - `Settings.js` – manage timer settings and options

### 2.1 App.js – the “brain” on the frontend

Key ideas:

- Uses **state** to store important data:

  ```js
  const [activeTab, setActiveTab] = useState('timer');
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(null);
  ```

  - `activeTab`: which view is shown (Timer, Dashboard, History, Subjects, Settings)
  - `subjects`: list of subjects from the backend
  - `sessions`: list of study sessions from the backend
  - `settings`: timer settings from the backend

- On first load, `useEffect` runs once and calls the backend to fetch data:

  ```js
  useEffect(() => {
    loadSubjects();
    loadSessions();
    loadSettings();
  }, []);
  ```

- Each `loadX` function uses Axios to call the API:

  - `GET /api/subjects` → fills `subjects`
  - `GET /api/sessions` → fills `sessions`
  - `GET /api/settings` → fills `settings`

- App also defines CRUD helper functions and passes them to child components as **props**:

  - `addSubject`, `updateSubject`, `deleteSubject`
  - `addSession`, `deleteSession`
  - `updateSettings`

  Example: `Timer` receives these props:

  ```jsx
  <Timer
    subjects={subjects}
    addSubject={addSubject}
    addSession={addSession}
    settings={settings}
  />
  ```

  So `Timer` does **not** talk to the server directly – it calls these functions, and `App` handles the Axios / API part.

- Navigation is done by a simple tab bar using `activeTab`:

  ```jsx
  <button
    className={`nav-tab ${activeTab === 'timer' ? 'active' : ''}`}
    onClick={() => setActiveTab('timer')}
  >
    Timer
  </button>
  ```

  `renderContent()` returns the right component based on `activeTab`.

### 2.2 Timer.js – Pomodoro logic and saving sessions

`client/src/components/Timer.js` is responsible for:

1. Managing the countdown timer (work / short break / long break)
2. Collecting information about the study session
3. Calling `addSession` to save the session when the user is done

Important state variables:

- `timeLeft`: seconds left in the current phase
- `isActive`: is the timer currently running?
- `mode`: `'work'`, `'shortBreak'`, or `'longBreak'`
- `completedSessions`: number of work sessions completed in this cycle
- `sessionInProgress`: whether a study session is currently ongoing
- Session info:
  - `selectedSubject`
  - `topic`
- For accurate duration tracking:
  - `studyStartTime`
  - `totalPausedTime`
  - `lastPauseTime`
- Rating popup:
  - `showRatingPopup`
  - `pendingRating`

#### 2.2.1 Using settings to set durations

When the mode or settings change and the timer is not running, a `useEffect` sets the time:

```js
useEffect(() => {
  if (settings && !isActive) {
    const duration =
      mode === 'work'
        ? settings.workDuration
        : mode === 'shortBreak'
        ? settings.shortBreakDuration
        : settings.longBreakDuration;

    setTimeLeft(duration * 60);
  }
}, [settings, mode, isActive]);
```

So the timer durations are fully configurable via the Settings component, and the Timer uses those values instead of hard-coded ones.

#### 2.2.2 Countdown logic

Another `useEffect` handles the ticking:

```js
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
```

- If `isActive` is true, it decreases `timeLeft` every second.
- When `timeLeft` reaches 0, it calls `handleTimerComplete()`.

#### 2.2.3 When a work / break segment finishes

`handleTimerComplete` does:

- Plays a sound (if `settings.soundEnabled` is true)
- If in **work mode**:
  - Increments `completedSessions`
  - If the number of completed sessions hits `sessionsBeforeLongBreak`, it switches to a **long break**
  - Otherwise, it switches to a **short break**
- If in **break mode**:
  - Switches back to `work`
- Sets `timeLeft` for the next phase so the timer continues automatically

#### 2.2.4 Start / pause / resume / stop & rate

- **Start** (`startTimer`):
  - Requires a subject and a topic
  - Sets `isActive` to `true`, marks `sessionInProgress` as true, records `studyStartTime`

- **Pause** / **Resume**:
  - On pause: `isActive = false`, saves `lastPauseTime`
  - On resume: updates `totalPausedTime` with how long it was paused

- **Stop & Rate** (`stopAndRate`):
  - If `completedSessions > 0`, shows the rating popup
  - If nothing completed, just resets the timer

- **Submit rating** (`handleRatingSubmit`):
  - Calculates total minutes: `now - studyStartTime - totalPausedTime`
  - Calls `addSession` (from `App`) with:
    - `subject` (id)
    - `topic`
    - `duration` (minutes)
    - `workSessions` (number of completed work sessions)
    - `productivityRating` (1–5)
  - Then closes popup and resets the timer

#### 2.2.5 Creating subjects from the Timer

The Timer lets the user:

- Pick an existing subject from a dropdown, **or**
- Create a new one (subject name + color)

When a new subject is created:

- `Timer` calls `addSubject` (from `App`)
- Backend creates the subject and returns it
- `App` updates `subjects` state
- `Timer` sets `selectedSubject` to the new subject’s id

So you can summarize the Timer as:

> “Timer manages time and user interactions. When a study session is finished, it calls `addSession`, which hits the backend API to save the session in the database.”

### 2.3 Other frontend components (high level)

- **`Dashboard.js`**:
  - Shows weekly / today stats with charts (Recharts)
  - Uses endpoints like `GET /api/sessions/stats/weekly` and `GET /api/sessions/stats/today`

- **`SessionHistory.js`**:
  - Shows a list of past sessions
  - Supports filtering and deleting sessions
  - Uses the `sessions` prop and `deleteSession` prop

- **`SubjectManager.js`**:
  - CRUD UI for subjects
  - Uses `subjects`, `addSubject`, `updateSubject`, `deleteSubject`

- **`Settings.js`**:
  - Shows and updates user settings
  - Uses `settings` and `updateSettings` (which calls `PUT /api/settings`)

---

## 3. Backend overview (Express + MongoDB)

Main files:

- `server/server.js` – Express app and MongoDB connection
- `server/routes/` – Express routers:
  - `sessions.js`
  - `subjects.js`
  - `settings.js`
- `server/models/` – Mongoose models:
  - `Session.js`
  - `Subject.js`
  - `Settings.js`

### 3.1 server.js – Express server and routes

```js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pomodoro-study-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pomodoro API is running!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Explain it simply:

- **Express app**: `app = express()` creates the server.
- **Middleware**:
  - `cors()` allows the React app on `localhost:3000` to call the API on `localhost:5001`.
  - `express.json()` parses JSON request bodies into `req.body`.
- **MongoDB connection**: `mongoose.connect(...)` connects to the MongoDB database.
- **Routes**:
  - All `/api/sessions/...` requests go to `routes/sessions.js`
  - All `/api/subjects/...` requests go to `routes/subjects.js`
  - All `/api/settings/...` requests go to `routes/settings.js`
- **Health check**: simple endpoint to confirm the API is running.

### 3.2 Models concept (MongoDB + Mongoose)

In `server/models/` you define Mongoose schemas for collections.

Conceptually:

- **Subject**:
  - Fields: `name`, `color`, etc.

- **Session**:
  - Fields:
    - `subject` (ObjectId reference to Subject)
    - `topic`
    - `duration` (minutes)
    - `workSessions` (number of Pomodoros)
    - `productivityRating`
    - `notes`
    - `completedAt` (date)

- **Settings**:
  - Fields like `workDuration`, `shortBreakDuration`, `longBreakDuration`, `sessionsBeforeLongBreak`, `soundEnabled`, etc.

Mongoose uses these models to:

- Create and save documents
- Query documents with filters
- Use `.populate('subject')` to automatically replace subject ids with full subject objects.

### 3.3 Sessions routes – example of backend logic

File: `server/routes/sessions.js`

Key endpoints:

#### 3.3.1 `GET /api/sessions` – list sessions with filters

- Accepts optional query parameters:
  - `startDate`, `endDate` → filter by date range
  - `subject` → filter by subject id
  - `minRating` → filter by minimum productivity rating

- Builds a `query` object based on these filters.
- Does `Session.find(query).populate('subject').sort({ completedAt: -1 })`.
- Returns a JSON array of sessions with subject details included.

#### 3.3.2 `GET /api/sessions/stats/weekly` – weekly stats

- Calculates the date one week ago.
- Finds all sessions where `completedAt` is within the last 7 days.
- Computes:
  - `totalMinutes`: sum of `duration` for all sessions
  - `totalSessions`: sum of `workSessions` (or 1 if not set)
  - `avgRating`: average `productivityRating`
- Groups stats:
  - By day → `dailyStats` (minutes and sessions per day)
  - By subject → `subjectStats` (minutes, sessions, color per subject)

Frontend uses this for charts in the Dashboard.

#### 3.3.3 `GET /api/sessions/stats/today` – today’s stats

- Calculates start and end of today.
- Finds sessions between those times.
- Returns:
  - `totalMinutes` today
  - `totalSessions` today
  - `sessions` list

#### 3.3.4 `POST /api/sessions` – create a session

- Reads JSON from `req.body`:
  - `subject`, `topic`, `duration`, `workSessions`, `productivityRating`, `notes`, etc.
- Creates a new `Session` document and saves it.
- Then fetches it again using `.populate('subject')` so the response includes full subject info.
- Returns the new session with `201 Created` status.

This is what gets called when Timer finishes and the user submits a rating.

#### 3.3.5 `PUT /api/sessions/:id` – update

- Finds a session by id.
- Updates fields that are present in `req.body`.
- Saves and returns the updated session (also populated with subject).

#### 3.3.6 `DELETE /api/sessions/:id` – delete

- Finds a session by id.
- Deletes it.
- Returns a success message.

`subjects.js` and `settings.js` are similar CRUD-style routers for their own models.

---

## 4. End-to-end flow: how frontend and backend talk

Use this as a narrative in your review.

### 4.1 App startup

1. User opens `http://localhost:3000`.
2. React app (`App.js`) mounts and runs `useEffect` once.
3. It calls three backend endpoints:
   - `GET /api/subjects`
   - `GET /api/sessions`
   - `GET /api/settings`
4. `server.js` forwards these to the corresponding routers.
5. Each router uses its Mongoose model to query MongoDB and returns JSON.
6. `App` updates its state (`subjects`, `sessions`, `settings`) and passes data down to components.

### 4.2 Running a study session (Timer)

1. User goes to the **Timer** tab.
2. They pick a subject (or create a new one, which calls `addSubject` → `POST /api/subjects`).
3. They enter a topic description.
4. They click **Start Session**.
   - Timer checks subject + topic
   - Sets `isActive = true`, records `studyStartTime`
   - Uses `settings` to determine how long the work session lasts
5. Timer counts down, updating the UI every second.
6. When a work session ends, `handleTimerComplete` is called:
   - Increments `completedSessions`
   - Switches to short or long break based on `settings.sessionsBeforeLongBreak`
   - Sets `timeLeft` for the break
7. When the user is done and clicks **Stop & Reset**, if there are completed sessions:
   - Rating popup opens
   - When they submit rating, Timer calculates total minutes and calls `addSession`.

### 4.3 Saving the session to the backend

1. `addSession` in `App.js` sends a `POST /api/sessions` request with JSON body:

   ```json
   {
     "subject": "<subjectId>",
     "topic": "Calculus - Integration",
     "duration": 42,
     "workSessions": 2,
     "productivityRating": 4,
     "notes": ""
   }
   ```

2. Express receives the request at `/api/sessions` and the router creates a new Session document.
3. Mongoose saves it in MongoDB.
4. The route responds with the newly created session (with subject populated).
5. `App` adds that to the `sessions` state and also reloads all sessions to keep statistics up to date.

### 4.4 Viewing stats and history

- **Dashboard** calls:
  - `GET /api/sessions/stats/weekly`
  - `GET /api/sessions/stats/today`

  Backend returns aggregated data (total minutes, total sessions, per-day and per-subject stats). Dashboard uses this for charts.

- **Session History** shows the `sessions` state and allows deleting a session, which sends `DELETE /api/sessions/:id`.

- **Subjects** and **Settings**:
  - CRUD operations call their respective endpoints (`/api/subjects`, `/api/settings`) and keep both frontend state and database in sync.

---

## 5. One-sentence summary

> “This is a React single-page app with a Pomodoro timer on the frontend and an Express/MongoDB backend. The frontend manages UI state and calls REST API endpoints to save and retrieve subjects, study sessions, and settings, and the Dashboard/History views visualize that stored data.”
