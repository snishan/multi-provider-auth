# 🔐 Fullstack Social Login App
![React App](https://github.com/user-attachments/assets/802ff74b-5566-4a08-9400-b6bbfeb6fbbc)


A modern full-stack application implementing secure authentication via **Google**, **GitHub**, and **Microsoft Azure AD**. Built using **React** and **Node.js**, this project demonstrates OAuth2 login, JWT-based session handling, and scalable user management using Passport.js and MongoDB.

**OAuth Providers**  
Google • GitHub • Azure AD

---

## ✨ Features

### Authentication
- 🔐 Login with Google, GitHub, and Microsoft Azure
- 🔑 JWT (access + refresh token) authentication after OAuth
- 🔄 Secure token rotation and session management
- 📤 Logout mechanism

### User Management
- 👤 Automatically create new users on first login
- 🔗 Link multiple providers to the same user account
- 📅 Track last login timestamp
- 📧 Email verification via provider-based emails

### Security
- 🔐 Access tokens expire quickly
- 🔄 Refresh token rotation
- 🧼 Sanitized input handling
- 🛡️ Secure environment variables for secrets
- ❌ CSRF, XSS-safe (no cookies or vulnerable redirects)

---

## 🧩 Project Structure
```
multi-provider-auth/
│
├── server-app/ # Node.js + Express + Passport.js
│ ├── config/ # Passport strategy configuration
│ ├── models/ # Mongoose user model
│ ├── routes/ # Auth routes for Google, GitHub, Azure
│ ├── utils/ # JWT token generation and helpers
│ ├── middleware/ # JWT verification middleware
│ └── server.js # Entry point
│
├── client-app/ # React app with routing and API integration
│ ├── src/
│ │ ├── components/ # Login buttons, user dashboard, etc.
│ │ ├── pages/ # Main routes
│ │ ├── services/ # API calls using Axios
│ │ └── hooks/ # Auth state management
│ └── package.json
│
└── README.md
```


---

## 🛠️ Tech Stack

### Frontend
- React
- Axios
- React Router
- React Icons
- Context API

### Backend
- Node.js + Express
- Passport.js (Google, GitHub, Azure strategies)
- JWT for authentication
- MongoDB + Mongoose
- dotenv for config
- Helmet & Rate Limiting for security

---

## 🚀 Getting Started

### 📦 Prerequisites

- Node.js ≥ 18.x
- MongoDB (local or Atlas)
- Google, GitHub, Azure developer credentials

---

### 🔧 Backend Setup

```bash
cd server-app
npm install
npm run dev
```

### 🔧 FrontEnd Setup

```bash
cd client-app
npm install
npm start
```

## 🔒 Security Best Practices

✅ Use HTTPS in production

✅ Use environment variables for secrets

✅ Rotate refresh tokens on each login

✅ Store JWTs securely (e.g., in memory, not localStorage)

✅ Rate limit login routes to prevent brute force

## 🙌 Author

Built with ❤️ by Sandun Thilakarathna

Feel free to fork, modify, or use this project to learn or bootstrap your own fullstack applications.

