-- Create the database if it doesn't exist
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
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'student') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    created_by INT,
    status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- ==========================================
-- SAMPLE DATA INSERTION
-- ==========================================

-- 1. Insert Users (Password is 'password123' hashed with bcrypt for demo purposes)
-- Note: In a real scenario, use your app to register effectively to get correct hashes.
-- These are placeholders. You should Register via the App to get a working login if these hashes fail.
INSERT INTO users (firstName, lastName, email, password, role) VALUES 
('Admin', 'User', 'admin@neutral.com', '$2b$12$r..passwordhashplaceholder...', 'admin'),
('Teacher', 'Staff', 'staff@neutral.com', '$2b$12$r..passwordhashplaceholder...', 'staff'),
('John', 'Student', 'student@neutral.com', '$2b$12$r..passwordhashplaceholder...', 'student'),
('Jane', 'Doe', 'jane@neutral.com', '$2b$12$r..passwordhashplaceholder...', 'student');

-- 2. Insert Exams
INSERT INTO exams (title, description, duration_minutes, total_marks, passing_marks, created_by, status) VALUES 
('General Knowledge Quiz', 'A basic quiz to test general awareness.', 30, 50, 20, 1, 'published'),
('Mathematics Final', 'End of term mathematics assessment.', 90, 100, 40, 2, 'published'),
('React JS Basics', 'Introductory test for React developers.', 45, 50, 25, 1, 'draft');

-- 3. Insert Questions for 'General Knowledge Quiz' (assuming ID=1)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks) VALUES 
(1, 'What is the capital of France?', 'mcq', '["London", "Berlin", "Paris", "Madrid"]', 'Paris', 5),
(1, 'Who wrote "Hamlet"?', 'mcq', '["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"]', 'William Shakespeare', 5),
(1, 'What is the chemical symbol for Gold?', 'mcq', '["Au", "Ag", "Fe", "Pb"]', 'Au', 5),
(1, 'Which planet is known as the Red Planet?', 'mcq', '["Earth", "Mars", "Jupiter", "Venus"]', 'Mars', 5),
(1, 'What is 5 + 7?', 'mcq', '["10", "11", "12", "13"]', '12', 5);

-- 4. Insert Questions for 'Mathematics Final' (assuming ID=2)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks) VALUES 
(2, 'Solve for x: 2x + 5 = 15', 'mcq', '["5", "10", "15", "20"]', '5', 10),
(2, 'What is the value of Pi (approx)?', 'mcq', '["3.14", "2.14", "4.14", "3.41"]', '3.14', 10);

-- 5. Insert Sample Results
-- 5. Insert Sample Results
INSERT INTO results (user_id, exam_id, score, status) VALUES 
(3, 1, 45, 'pass'), -- John Student passed General Knowledge
(4, 1, 15, 'fail'); -- Jane Doe failed General Knowledge

-- ==========================================
-- 5. CLASSES & SECTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id INT,
    class_code VARCHAR(50) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS class_students (
    class_id INT NOT NULL,
    user_id INT NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- SAMPLE DATA FOR NEW MODULES
INSERT INTO classes (name, teacher_id, class_code, description) VALUES 
('Computer Science A', 2, 'CS101', 'Intro to Computer Science'),
('Advanced Mathematics', 2, 'MA302', 'Calculus and Algebra');

INSERT INTO library_resources (title, resource_type, file_size, category, uploaded_by) VALUES 
('Calculus Study Guide', 'PDF', '2.4 MB', 'Study Guide', 1),
('React JS Roadmap', 'PDF', '1.1 MB', 'Web Dev', 1);

INSERT INTO calendar_events (title, event_date, event_type, color, created_by) VALUES 
('Maths Final Exam', '2023-11-05', 'exam', 'error', 1),
('Project Submission', '2023-11-18', 'submission', 'warning', 1);
