-- ==========================================
-- 1. SHOW ALL USERS (For User Management Table)
-- ==========================================
SELECT id, firstName, lastName, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- ==========================================
-- 2. SHOW ALL EXAMS (For Exam List Table)
-- JOINs with users table to show who created the exam
-- ==========================================
SELECT 
    e.id, 
    e.title, 
    e.description, 
    e.duration_minutes, 
    e.total_marks, 
    e.status, 
    e.created_at,
    CONCAT(u.firstName, ' ', u.lastName) AS created_by_name
FROM exams e
LEFT JOIN users u ON e.created_by = u.id
ORDER BY e.created_at DESC;

-- ==========================================
-- 3. SHOW QUESTIONS FOR A SPECIFIC EXAM (e.g., Exam ID = 1)
-- ==========================================
SELECT * FROM questions 
WHERE exam_id = 1;

-- ==========================================
-- 4. SHOW STUDENT RESULTS (For Results Table)
-- JOINs users and exams to show names instead of IDs
-- ==========================================
SELECT 
    r.id,
    CONCAT(u.firstName, ' ', u.lastName) AS student_name,
    e.title AS exam_title,
    r.score,
    r.status, -- 'pass' or 'fail'
    r.submitted_at
FROM results r
JOIN users u ON r.user_id = u.id
JOIN exams e ON r.exam_id = e.id
ORDER BY r.submitted_at DESC;
