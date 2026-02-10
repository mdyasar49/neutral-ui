# 🎓 Neutral UI - Full-Stack Academic Platform

[![License: Private](https://img.shields.io/badge/License-Private-red.svg)](README.md)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-OpenAI-blueviolet.svg)](https://openai.com)

**Neutral UI** is a state-of-the-art academic management ecosystem. It bridges the gap between administrative efficiency and student engagement using a sleek Material UI design and a robust Python-powered intelligence engine.

---

## 🌟 Vision & Design Philosophy

The name **"Neutral UI"** reflects our commitment to a minimalist, distraction-free environment. We utilize curated neutral palettes (HSL tailored), smooth glassmorphism effects, and premium micro-animations to ensure that "Administrative Work" feels like a "Premium Experience."

---

## 🚀 Core Features

### 🧠 AI-Enhanced Examination

- **Auto-Question Generation**: Powered by GPT, educators can generate valid questions from a single topic input.
- **Hybrid Forms**: Support for MCQs and Written answers with automated grading logic.
- **Proctor-Ready**: Time-bound sessions with real-time performance tracking.

### 👥 Comprehensive Role Management

- **Admin Dashboard**: Central command for user creation, class scheduling, and institutional metrics.
- **Teacher Hub**: Specialized views for student assignment, exam creation, and internal messaging.
- **Student Portal**: Track library resources, upcoming exams, and detailed result analytics.

### 📊 Performance Analytics

- **Progress Tracking**: Visual linear and circular metrics for exam scores.
- **Result Portal**: Automated result calculation with downloadable PDF reports.

### 📅 Smart Organization

- **Integrated Calendar**: Manage holidays, attendance, and schedules in one unified view.
- **Internal Messaging**: Socket.IO enabled real-time mail system for institutional communication.

---

## 🛠️ Infrastructure Stack

| Layer            | Technologies                                                          |
| :--------------- | :-------------------------------------------------------------------- |
| **Frontend**     | React 18, Material UI (MUI), Axios, React Hook Form, Socket.IO Client |
| **Backend**      | Python Flask, Flask-Cors, Flask-SocketIO, JWT                         |
| **Intelligence** | OpenAI API (GPT-3.5/4 Integration)                                    |
| **Database**     | MySQL (with dedicated `database.sql` schema)                          |
| **Identity**     | Bcrypt Hashing, JWT Authentication                                    |

---

## 🚦 Quick Start Guide

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mdyasar49/Neutral-UI.git
cd Neutral-UI
```

### 2️⃣ Initialize Backend

```bash
cd backend
pip install -r requirements.txt
# Configure db_config.ini with your MySQL & OpenAI credentials
python app.py
```

### 3️⃣ Initialize Frontend

```bash
cd frontend
npm install
npm start
```

---

## 📁 Repository Structure

```text
Neutral-UI/
├── 📂 frontend/    # React application
├── 📂 backend/     # Flask API & Database scripts
├── 📄 .gitignore
└── 📄 README.md    # Main documentation
```

---

## 📜 Legal

This project is proprietary and confidential.  
© 2026 **mdyasar49**. All rights reserved.
