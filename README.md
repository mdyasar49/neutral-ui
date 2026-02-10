# 🎓 Neutral UI - Academic Management Platform

Neutral UI is a modern, full-stack academic management system designed to streamline school operations, exam scheduling, and student-teacher interactions. Built with a premium Material UI design and a robust Python backend.

## 🚀 Key Features

### 📅 Advanced Academic Calendar

- **World Calendar**: Integrated public holidays API to track global festivals.
- **Smart Scheduling**: Click on any date to instantly schedule exams, classes, or reminders.
- **Schedule Overview**: A "Complete Schedule" modal to view the entire year's activities at a glance.

### 👥 Intelligent User Management

- **Role-Based Access**: Specialized views for Administrators, Teachers (Staff), and Students.
- **Dynamic Teacher Assignment**: Admins can link students to specific teachers; Teachers auto-assign students to themselves.
- **Secure Authentication**: JWT-based login, bcrypt password hashing, and auto-logout for security.

### 🏫 Classes & Batches

- **Full CRUD Support**: Create, manage, and edit academic departments and classes.
- **Student Rosters**: Track enrollment numbers and assigned class teachers dynamically.

### 📝 Exam & Result Engine

- **AI-Powered Questions**: Integrated AI service to generate exam questions based on topics and difficulty.
- **Performance Analytics**: Visual progress charts and circular performance metrics.
- **Result Management**: Downloadable PDF results and detailed performance notes.

### 📚 Digital Library

- **Resource Hub**: Centralized location for study materials and department resources.
- **Instant Upload/Download**: Quick-action file management with category filtering.

---

## 🛠️ Technology Stack

**Frontend:**

- **React.js** (Functional Components, Hooks)
- **Material UI (MUI)** (Premium component design)
- **Axios** (API communication)
- **Formik & Yup** (Robust form management)

**Backend:**

- **Python Flask** (RESTful API)
- **MySQL** (Relational Database)
- **JWT** (Secure Authentication tokens)
- **Bcrypt** (Military-grade password security)

---

## ⚙️ Development Setup

### 📦 Backend Setup

1. Navigate to the `/backend` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your database in `db_config.ini`.
4. Run the server:
   ```bash
   python app.py
   ```

### 💻 Frontend Setup

1. Navigate to the `/frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

---

## 🧹 Project Cleanliness

This repository is maintained with a focus on clean, modular code. Recent maintenance included:

- Removal of redundant boilerplate and template files.
- Centralized `services/` layer for all API interactions.
- Reusable `ConfirmDialog` component to replace browser-native alerts.

## 📜 License

This project is private property of **mdyasar49**. All rights reserved.
