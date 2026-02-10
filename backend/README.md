# ⚙️ Neutral UI - Backend API

The intelligence hub of the Neutral UI ecosystem. A RESTful API built with **Python Flask**, providing secure data management, real-time communication, and AI integration.

## 🛠️ Performance Tech Stack

- **Framework**: Flask (Python 3.x)
- **Real-time**: Flask-SocketIO (Institutional Mails)
- **AI**: OpenAI SDK (Question Synthesis)
- **Database**: MySQL (Optimized queries)
- **Security**: JWT (TSEC tokens), Bcrypt (Password hashing)

## 🗄️ Database Schema

The system uses a relational MySQL database. The primary schema can be found in `database.sql`.

- **`users`**: Unified table for Admin, Staff, and Students.
- **`exams`**: Metadata for assessments including duration and marks.
- **`questions`**: Linked to exams, supports JSON-serialized options for MCQs.
- **`messages`**: Internal mailing system records.
- **`classes`**: Academic structural mapping.

## 🚀 Installation & Config

1.  **Clone dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Environment Configuration**:
    Rename `db_config.example.ini` to `db_config.ini` and provide:
    - MySQL Host/User/Password.
    - OpenAI API Key (for AI features).
    - SMTP settings (for institutional emails).

3.  **Run the application**:
    ```bash
    python app.py
    ```

## 📡 API Overview (Endpoints)

- `/api/auth/login`: Identity verification.
- `/api/exams`: Full CRUD for assessments.
- `/api/ai/generate-questions`: AI prompt engineering endpoint.
- `/api/users`: Multi-role user management.
- `/api/messages`: Social/Academic communication layer.

## 🛠️ Utility Scripts

- `create_admin.py`: Quickly seed a super-admin user.
- `update_db.py`: Migration script for database changes.
- `init_mail_db.py`: Setup script for the institutional mailing system.
