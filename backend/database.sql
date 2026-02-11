-- ==========================================
-- DATABASE SETUP
-- ==========================================
CREATE DATABASE IF NOT EXISTS neutral_db;
USE neutral_db;

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Plain text as requested
    role ENUM('admin', 'staff', 'student') DEFAULT 'student',
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(255)
);

-- ==========================================
-- 2. EXAMS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    total_marks INT NOT NULL DEFAULT 100,
    passing_marks INT NOT NULL DEFAULT 40,
    status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(255)
);

-- ==========================================
-- 3. QUESTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('mcq', 'text') DEFAULT 'mcq',
    options JSON, -- Stores options like ["A", "B", "C", "D"] for MCQ
    correct_answer TEXT,
    marks INT DEFAULT 1,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(255),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- ==========================================
-- 4. STUDENT RESULTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    score INT DEFAULT 0,
    status ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. CLASSES & SECTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id INT,
    class_code VARCHAR(50) UNIQUE,
    description TEXT,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(255),
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS class_students (
    class_id INT NOT NULL,
    user_id INT NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(255),
    PRIMARY KEY (class_id, user_id),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. LIBRARY RESOURCES
-- ==========================================
CREATE TABLE IF NOT EXISTS library_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    resource_type ENUM('PDF', 'DOC', 'ZIP', 'LINK') DEFAULT 'PDF',
    file_path VARCHAR(500),
    file_size VARCHAR(50),
    category VARCHAR(50),
    uploaded_by INT,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(255),
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- 7. CALENDAR EVENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_type ENUM('exam', 'class', 'submission', 'event') DEFAULT 'event',
    description TEXT,
    color VARCHAR(20) DEFAULT 'primary',
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(255)
);

-- ==========================================
-- 8. MESSAGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NULL,
    receiver_email VARCHAR(255) NULL,
    subject VARCHAR(255),
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    status ENUM('sent', 'failed') DEFAULT 'sent',
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(255),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- SAMPLE DATA INSERTION
-- ==========================================

-- 1. Insert Users
INSERT INTO users (firstName, lastName, email, password, role, created_by) VALUES 
('Admin', 'User', 'admin@neutral.com', 'password123', 'admin', 'System'),
('Teacher', 'Staff', 'staff@neutral.com', 'password123', 'staff', 'System'),
('John', 'Student', 'student@neutral.com', 'password123', 'student', 'System'),
('Jane', 'Doe', 'jane@neutral.com', 'password123', 'student', 'System');

-- 2. Insert Exams
INSERT INTO exams (title, description, duration_minutes, total_marks, passing_marks, created_by, status) VALUES 
('General Knowledge Quiz', 'A basic quiz to test general awareness.', 30, 50, 20, 'Admin User', 'published'),
('Mathematics Final', 'End of term mathematics assessment.', 90, 100, 40, 'Teacher Staff', 'published'),
('React JS Basics', 'Introductory test for React developers.', 45, 50, 25, 'Admin User', 'draft');

-- 3. Insert Questions
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks, created_by) VALUES 
(1, 'What is the capital of France?', 'mcq', '["London", "Berlin", "Paris", "Madrid"]', 'Paris', 5, 'Admin User'),
(1, 'Who wrote "Hamlet"?', 'mcq', '["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"]', 'William Shakespeare', 5, 'Admin User'),
(1, 'What is the chemical symbol for Gold?', 'mcq', '["Au", "Ag", "Fe", "Pb"]', 'Au', 5, 'Admin User'),
(1, 'Which planet is known as the Red Planet?', 'mcq', '["Earth", "Mars", "Jupiter", "Venus"]', 'Mars', 5, 'Admin User'),
(1, 'What is 5 + 7?', 'mcq', '["10", "11", "12", "13"]', '12', 5, 'Admin User');

-- 4. Insert Questions for 'Mathematics Final'
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks, created_by) VALUES 
(2, 'Solve for x: 2x + 5 = 15', 'mcq', '["5", "10", "15", "20"]', '5', 10, 'Teacher Staff'),
(2, 'What is the value of Pi (approx)?', 'mcq', '["3.14", "2.14", "4.14", "3.41"]', '3.14', 10, 'Teacher Staff');

-- 5. Insert Sample Results
INSERT INTO results (user_id, exam_id, score, status, created_by) VALUES 
(3, 1, 45, 'pass', 'System'),
(4, 1, 15, 'fail', 'System');

-- 6. Insert Classes
INSERT INTO classes (name, teacher_id, class_code, description, created_by) VALUES 
('Computer Science A', 2, 'CS101', 'Intro to Computer Science', 'Admin User'),
('Advanced Mathematics', 2, 'MA302', 'Calculus and Algebra', 'Admin User');

-- 7. Insert Library Resources
INSERT INTO library_resources (title, resource_type, file_size, category, uploaded_by, created_by) VALUES 
('Calculus Study Guide', 'PDF', '2.4 MB', 'Study Guide', 1, 'Admin User'),
('React JS Roadmap', 'PDF', '1.1 MB', 'Web Dev', 1, 'Admin User');

-- 8. Insert Calendar Events
INSERT INTO calendar_events (title, event_date, event_type, color, created_by) VALUES 
('Maths Final Exam', '2023-11-05', 'exam', 'error', 'Admin User'),
('Project Submission', '2023-11-18', 'submission', 'warning', 'Admin User');


-- ==========================================
-- MIGRATION / UPDATE SCRIPTS (For Existing DB)
-- ==========================================

/*
-- Run these scripts only if your tables are already created and you need to add the new columns.

-- 1. USERS Table
ALTER TABLE users ADD COLUMN created_by VARCHAR(255);
ALTER TABLE users ADD COLUMN modified_by VARCHAR(255);
ALTER TABLE users CHANGE COLUMN created_at created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users CHANGE COLUMN updated_at modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. EXAMS Table
ALTER TABLE exams DROP FOREIGN KEY exams_ibfk_1; 
ALTER TABLE exams MODIFY COLUMN created_by VARCHAR(255);
ALTER TABLE exams CHANGE COLUMN created_at created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE exams ADD COLUMN modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE exams ADD COLUMN modified_by VARCHAR(255);

-- 3. QUESTIONS Table
ALTER TABLE questions CHANGE COLUMN created_at created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE questions ADD COLUMN created_by VARCHAR(255);
ALTER TABLE questions ADD COLUMN modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE questions ADD COLUMN modified_by VARCHAR(255);

-- 4. RESULTS Table
ALTER TABLE results ADD COLUMN created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE results ADD COLUMN created_by VARCHAR(255);
ALTER TABLE results ADD COLUMN modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE results ADD COLUMN modified_by VARCHAR(255);

-- 5. CLASSES Table
ALTER TABLE classes CHANGE COLUMN created_at created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE classes ADD COLUMN created_by VARCHAR(255);
ALTER TABLE classes ADD COLUMN modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE classes ADD COLUMN modified_by VARCHAR(255);

-- 6. CLASS_STUDENTS Table
ALTER TABLE class_students ADD COLUMN created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE class_students ADD COLUMN created_by VARCHAR(255);
ALTER TABLE class_students ADD COLUMN modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE class_students ADD COLUMN modified_by VARCHAR(255);

-- 7. LIBRARY_RESOURCES Table
ALTER TABLE library_resources CHANGE COLUMN created_at created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE library_resources ADD COLUMN created_by VARCHAR(255);
ALTER TABLE library_resources ADD COLUMN modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE library_resources ADD COLUMN modified_by VARCHAR(255);

-- 8. CALENDAR_EVENTS Table
ALTER TABLE calendar_events DROP FOREIGN KEY calendar_events_ibfk_1;
ALTER TABLE calendar_events MODIFY COLUMN created_by VARCHAR(255);
ALTER TABLE calendar_events CHANGE COLUMN created_at created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE calendar_events ADD COLUMN modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE calendar_events ADD COLUMN modified_by VARCHAR(255);

-- 9. MESSAGES Table
ALTER TABLE messages CHANGE COLUMN created_at created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE messages ADD COLUMN created_by VARCHAR(255);
ALTER TABLE messages ADD COLUMN modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE messages ADD COLUMN modified_by VARCHAR(255);

-- Password fix for existing users
UPDATE users SET password = 'password123';
*/