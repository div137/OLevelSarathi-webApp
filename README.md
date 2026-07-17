# 🚀 TicTac Learning — React + Firebase Web App

## Project Structure

```
src/
├── firebase.js          ← 🔥 Firebase config (EDIT THIS FIRST!)
├── main.jsx
├── App.jsx              ← Routes setup
├── index.css            ← Global styles & design tokens
├── hooks/
│   └── useFirebase.js   ← Real-time Firebase data hook
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── HeroSlider.jsx   ← Uses Slider node from Firebase
└── pages/
    ├── Home.jsx          ← Landing page with slider & feature grid
    ├── Tests.jsx         ← MCQ quiz tests (from Tests node)
    ├── Theory.jsx        ← HTML theory content (from TheoryContent node)
    ├── PDFs.jsx          ← PDF notes (from Notifications node)
    └── Projects.jsx      ← Project showcase (from Projects node)
```

## 🛠️ Setup Steps

### Step 1: Fill Firebase Config
Open `src/firebase.js` and replace all placeholder values with your actual Firebase config:
```js
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_KEY",
  authDomain: "olevelsarathi.firebaseapp.com",
  databaseURL: "https://olevelsarathi-default-rtdb.firebaseio.com",
  projectId: "olevelsarathi",
  ...
};
```
Find your config at: Firebase Console → Project Settings → Your Apps → SDK Config

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Run dev server
```bash
npm run dev
```

### Step 4: Build for production
```bash
npm run build
```

## 📦 Firebase Database Nodes Used

| Page     | Firebase Node    | Fields Used                                          |
|----------|-----------------|------------------------------------------------------|
| Home     | Slider          | title, imageUrl, category, description, link         |
| Tests    | Tests           | title, questionsJson, level, date, totalQue, subject |
| Theory   | TheoryContent   | topicTitle, category, htmlContent, videoId           |
| PDFs     | Notifications   | title, category, url, date, hidden, views            |
| Projects | Projects        | title, imageUrl, description, techStack, price, fileUrl, reportUrl, demoUrl |

## 🔒 Firebase Rules (Recommended for read-only public access)
```json
{
  "rules": {
    ".read": true,
    ".write": false
  }
}
```

## 🎨 Design System
- Colors defined as CSS variables in `index.css`
- Dark theme with electric blue accents
- Font: Sora (display) + Space Mono (code)
