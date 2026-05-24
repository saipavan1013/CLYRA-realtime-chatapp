# 🌌 CLYRA — Realtime Chat Application

🚀 **Live Production Link**: [https://realtime-chat-app-880e3.web.app](https://realtime-chat-app-880e3.web.app)

Welcome to **CLYRA**! A modern, premium, and highly responsive real-time chat application built on top of **React**, **Vite**, **Firebase (Firestore, Authentication, and Storage)**, and styled beautifully using custom high-end styling systems.

CLYRA provides a seamless communication workspace packed with premium features, robust security rules, presence tracking, support ticketers, and full real-time synchronization.

---

## ✨ Features

- 💬 **Real-time Chats**: Instant messaging powered by Firestore database listeners.
- 👥 **Presence & Status**: Real-time user online/offline status indicator (`usePresence`).
- ✍️ **Typing Indicators**: High-performance, low-latency typing states showing who is currently composing a message.
- 🔒 **Comprehensive Security Rules**: Fully secured database pathways restricting message access to conversation participants.
- ⚙️ **Custom User Profiles & Settings**: Beautifully integrated profile settings modal allowing users to edit display names, avatars, and application preferences.
- 🎫 **Support Ticket System**: Integrated ticketing system for direct user feedback and support, complete with ticket assignment states.
- 🛡️ **Fault Tolerance & Safety**:
  - Global `ErrorBoundary` to gracefully catch and isolate React runtime exceptions.
  - Fail-safe Firebase environment config initialization that alerts users gracefully without blocking the whole browser.
- 🌓 **Dynamic Theme System**: Sleek toggles for custom dark mode/light mode configurations.

---

## 🛠️ Tech Stack

- **Frontend Core**: [React (v18.2)](https://react.dev/) & [Vite](https://vitejs.dev/) (Ultra-fast HMR and building pipeline)
- **Database & Sync**: [Firebase Web SDK (v10.14)](https://firebase.google.com/)
- **UI Components & Icons**: Custom high-fidelity CSS and interactive animations paired with [Ant Design Icons](https://ant.design/)
- **State Management**: React Hooks (`useUsers`, `useChatMessages`, `usePresence`, etc.) & Context Providers (`AuthContext`, `ThemeContext`, `NotificationContext`)

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### ⚙️ Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/saipavan1013/CLYRA-realtime-chatapp.git
   cd CLYRA-realtime-chatapp
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (you can copy `.env.example`) and fill in your Firebase configuration keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

---

## 💻 Local Development

Run the Vite development server locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🏗️ Production Build

Generate the optimized production-ready bundle inside the `dist/` directory:
```bash
npm run build
```

You can preview the production bundle locally using:
```bash
npm run preview
```

---

## ☁️ Firebase Deployment

CLYRA is pre-configured with Firebase Hosting and Firestore security rules. 

### Prerequisites
Ensure the Firebase CLI is installed locally and logged in:
```bash
npm install -g firebase-tools
firebase login
```

### Deploying the App and Rules
To compile the project and deploy both your static files (`dist/` directory) and `firestore.rules` directly to Firebase:

1. **Build the project**:
   ```bash
   npm run build
   ```
2. **Deploy via Firebase CLI**:
   ```bash
   npx firebase deploy
   ```

This will automatically publish the built application to Firebase Hosting and apply all security constraints to your live Firestore database instantly!

---

## 🛡️ Security Rules (`firestore.rules`)

Your data paths are protected by enterprise-grade security structures:
- **Profiles (`/users/{userId}`)**: Publicly readable by authenticated users; writable only by the account owner.
- **Conversations (`/conversations/{id}`)**: Access restricted solely to conversation participants.
- **Messages (`/messages/{id}`)**: Nested inside specific conversation rooms; readable only by conversational pairs.
- **Tickets & Presence**: Protected to only allow read/write authorization for the verified current user.
