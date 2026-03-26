# 🏢 Homesort
### Residential Flat & Maintenance Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-blue?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FCM-orange?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Homesort** is a professional, full-stack application designed to streamline resident management, subscription billing, and administrative reporting for residential complexes. It features a modernized dark-themed UI and robust backend architecture.

---

## 📖 Table of Contents
- [🚀 Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [⚙️ Getting Started](#️-getting-started)
- [🛡️ Security Features](#-security-features)
- [💡 Practical Examples](#-practical-examples)

---

## 🚀 Key Features

### 🛡️ Administrative Suite
- **Comprehensive Flat Management**: Create, edit, and manage flat details with automated resident account creation.
- **Dynamic Subscription Rates**: Define and update monthly maintenance rates flat type wise (e.g., 2BHK, 3BHK).
- **Automated Billing**: Every flat receives a "pending" monthly subscription record automatically upon creation.
- **Financial Reporting**: Generate and download detailed **CSV reports** (Monthly or Yearly) for all collections and dues.
- **Global Notifications**: Send broadcast or resident-specific push notifications using **Firebase Cloud Messaging (FCM)**.
- **Manual Payment Entry**: Admins can record offline or UPI payments on behalf of residents.

### 🏠 Resident Experience
- **Personalized Dashboard**: Real-time view of total pending dues and recent notifications.
- **Subscription History**: View detailed monthly billing records and payment status.
- **Direct Payments**: Integrated "Pay Now" simulated workflow for outstanding dues.
- **Notification Center**: Receive push notifications for important maintenance alerts or announcements.
- **Secure Profile**: Manage personal details and update account passwords.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14/15, Tailwind CSS, Lucide React, TypeScript |
| **Backend** | Node.js, Express, PostgreSQL |
| **Email** | Nodemailer (Automated Transactional Emails) |
| **Auth** | Passport.js (Google OAuth 2.0), Cookie-based Sessions |
| **Messaging** | Firebase Cloud Messaging (FCM) |

---

## 📂 Project Structure

```bash
├── backend/                # Express Server
│   ├── config/             # DB, Passport, Firebase setup
│   ├── controllers/        # Business Logic (flats, reports, etc.)
│   ├── routes/             # API Endpoints
│   ├── server.js           # Entry Point (ES Modules)
│   └── .env                # Server-side secrets
└── homesort/               # Next.js Frontend
    ├── src/app/            # App Router (Admin/Resident groups)
    ├── src/components/     # UI & Layout components
    ├── src/lib/            # Auth helpers & FCM logic
    ├── constant.ts         # Centralized API configuration
    └── .env.local          # Frontend public variables
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL or MySQL
- Firebase Project (for FCM)
- Gmail app password (for Nodemailer)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file with your credentials:
```env
PORT=5000
DATABASE_URL=your_db_connection_string
AUTH_GOOGLE_ID=your_google_id
AUTH_GOOGLE_SECRET=your_google_secret
AUTH_SECRET=your_session_secret
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
```

### 3. Frontend Setup
```bash
cd homesort
npm install
npm run dev
```

---

## 🛡️ Security Features
- **Transactional Consistency**: Uses SQL transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) for critical operations.
- **Safe Password Storage**: All passwords are salt-hashed using **Bcrypt**.
- **XSS Protection**: Uses **HTTP-Only Cookies** for identity management to prevent browser-side script access.
- **Environment Management**: Secure handling of API keys and database credentials via `.env`.

---

