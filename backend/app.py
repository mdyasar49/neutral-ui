from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from configparser import ConfigParser
import os
import bcrypt
import jwt
import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
def get_db_connection():
    config = ConfigParser()
    config.read('db_config.ini')
    db_config = config['DatabaseSection']

    try:
        connection = mysql.connector.connect(
            host=db_config['database.host'],
            user=db_config['database.user'],
            password=db_config['database.password'],
            database=db_config['database.dbname'],
            auth_plugin=db_config['database.auth_plugin']
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Secret Key for JWT (Should be in .env in production)
SECRET_KEY = "your_secret_key"

# ==========================================
# AUTH & USER ROUTES
# ==========================================

@app.route('/api/user/register', methods=['POST'])
def register_user():
    data = request.json
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "User already exists"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        try:
            query = "INSERT INTO users (firstName, lastName, email, password, role) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(query, (firstName, lastName, email, hashed_password, role))
            conn.commit()
            conn.close()
            return jsonify({"message": "User registered successfully"}), 201
        except mysql.connector.Error as err:
            conn.close()
            return jsonify({"error": str(err)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/user/login', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('user_email')
    password = data.get('user_password')

    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        conn.close()

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            token = jwt.encode({
                'user_id': user['id'],
                'role': user['role'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm="HS256")

            # Send Login Notification Email
            subject = "Security Alert: New login to your account"
            body = f"Hello {user['firstName']},\n\nWe noticed a successful login to your Neutral UI account at {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.\n\nIf this was not you, please secure your account immediately."
            send_smtp_email(user['email'], subject, body)

            return jsonify({
                'id': user['id'],
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'email': user['email'],
                'role': user['role'],
                'token': token
            }), 200
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/user/logout', methods=['POST'])
def logout_user():
    data = request.json
    email = data.get('email')
    firstName = data.get('firstName', 'User')
    
    if email:
        subject = "Logout Notification"
        body = f"Hello {firstName},\n\nYou have been successfully logged out of your Neutral UI account at {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}."
        # If it's an expiration logout, we can customize the message
        is_expired = data.get('expired', False)
        if is_expired:
            subject = "Session Expired"
            body = f"Hello {firstName},\n\nYour session has expired, and you have been logged out for security reasons at {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}."
        
        send_smtp_email(email, subject, body)
        return jsonify({"message": "Logout successful"}), 200
    return jsonify({"error": "Email required"}), 400

@app.route('/api/users', methods=['GET', 'POST'])
def handle_users():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        
        if request.method == 'GET':
            # Pagination & Search Params
            page = request.args.get('page', 1, type=int)
            limit = request.args.get('limit', 10, type=int)
            search = request.args.get('search', '')
            role_filter = request.args.get('role', '') # New: Support filtering by role
            offset = (page - 1) * limit
            
            # Base Query
            base_query = " FROM users"
            where_conds = []
            params = []
            
            if search:
                search_term = f"%{search}%"
                where_conds.append("(firstName LIKE %s OR lastName LIKE %s OR email LIKE %s)")
                params.extend([search_term, search_term, search_term])
                
            if role_filter and role_filter != 'all':
                where_conds.append("role = %s")
                params.append(role_filter)
                
            where_clause = " WHERE " + " AND ".join(where_conds) if where_conds else ""
                
            # Count Query
            count_query = f"SELECT COUNT(*) as total{base_query}{where_clause}"
            cursor.execute(count_query, tuple(params))
            total_count = cursor.fetchone()['total']
            
            # Data Query (Fixed %s to %S for seconds)
            query = f"SELECT id, firstName, lastName, email, role, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%S') as created_at{base_query}{where_clause} ORDER BY created_at DESC LIMIT %s OFFSET %s"
            params.extend([limit, offset])
            
            cursor.execute(query, tuple(params))
            users = cursor.fetchall()
            
            conn.close()
            return jsonify({
                "users": users, 
                "total": total_count,
                "page": page,
                "limit": limit
            })
    
    if request.method == 'POST':
        data = request.json
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student')
        teacher_id = data.get('teacher_id')
        
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400
            
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        try:
            query = "INSERT INTO users (firstName, lastName, email, password, role, teacher_id) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(query, (firstName, lastName, email, hashed_password, role, teacher_id))
            conn.commit()
            conn.close()
            return jsonify({"message": "User created successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/users/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_user(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database Error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    if request.method == 'GET':
        cursor.execute("SELECT id, firstName, lastName, email, role, teacher_id FROM users WHERE id = %s", (id,))
        user = cursor.fetchone()
        conn.close()
        if user:
            return jsonify(user)
        return jsonify({"error": "User not found"}), 404

    if request.method == 'PUT':
        data = request.json
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        email = data.get('email')
        role = data.get('role')
        teacher_id = data.get('teacher_id')
        password = data.get('password')
        
        try:
            if password:
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                query = "UPDATE users SET firstName=%s, lastName=%s, email=%s, role=%s, teacher_id=%s, password=%s WHERE id=%s"
                cursor.execute(query, (firstName, lastName, email, role, teacher_id, hashed_password, id))
            else:
                query = "UPDATE users SET firstName=%s, lastName=%s, email=%s, role=%s, teacher_id=%s WHERE id=%s"
                cursor.execute(query, (firstName, lastName, email, role, teacher_id, id))
            
            conn.commit()
            conn.close()
            return jsonify({"message": "User updated successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    if request.method == 'DELETE':
        cursor.execute("DELETE FROM users WHERE id = %s", (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "User deleted"})

    return jsonify({"error": "Method not allowed"}), 405

# ==========================================
# EXAM ROUTES
# ==========================================

@app.route('/api/exams', methods=['GET'])
def get_exams():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search = request.args.get('search', '')
        offset = (page - 1) * limit
        
        params = []
        where_conds = []
        
        if search:
            search_term = f"%{search}%"
            where_conds.append("(e.title LIKE %s OR e.description LIKE %s)")
            params.extend([search_term, search_term])
            
        where_clause = " WHERE " + " AND ".join(where_conds) if where_conds else ""
        
        # Count
        count_query = f"SELECT COUNT(*) as total FROM exams e{where_clause}"
        cursor.execute(count_query, tuple(params))
        total_count = cursor.fetchone()['total']
        
        # Data
        query = f"""
        SELECT 
            e.id, e.title, e.description, e.duration_minutes AS duration, 
            e.total_marks AS totalMarks, e.status, e.created_at AS scheduledDate,
            CONCAT(u.firstName, ' ', u.lastName) AS createdBy,
            (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS questionCount
        FROM exams e
        LEFT JOIN users u ON e.created_by = u.id
        {where_clause}
        ORDER BY e.created_at DESC
        LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])
        cursor.execute(query, tuple(params))
        exams = cursor.fetchall()
        
        conn.close()
        return jsonify({
            "exams": exams,
            "total": total_count,
            "page": page,
            "limit": limit
        })
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/exams/<int:id>', methods=['GET'])
def get_exam_details(id):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        # Fetch Exam
        cursor.execute("SELECT * FROM exams WHERE id = %s", (id,))
        exam = cursor.fetchone()
        
        if not exam:
            conn.close()
            return jsonify({"error": "Exam not found"}), 404

        # Fetch Questions
        cursor.execute("SELECT * FROM questions WHERE exam_id = %s", (id,))
        questions = cursor.fetchall()
        
        exam['questions'] = questions
        conn.close()
        return jsonify(exam)
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/exams/<int:id>', methods=['PUT'])
def update_exam(id):
    data = request.json
    title = data.get('title')
    description = data.get('description')
    duration = data.get('duration', 60)
    total_marks = data.get('totalMarks', 100)
    questions = data.get('questions', [])

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # 1. Update Exam Details
            status = data.get('status', 'draft')
            update_query = "UPDATE exams SET title=%s, description=%s, duration_minutes=%s, total_marks=%s, status=%s WHERE id=%s"
            cursor.execute(update_query, (title, description, duration, total_marks, status, id))

            # 2. Update Questions (Strategy: Delete all old questions and re-insert new ones)
            # This is simpler than tracking diffs for this scale
            cursor.execute("DELETE FROM questions WHERE exam_id = %s", (id,))
            
            for q in questions:
                q_text = q.get('question_text')
                q_type = q.get('question_type', 'mcq')
                options = q.get('options')
                correct = q.get('correct_answer')
                marks = q.get('marks', 1)
                
                import json
                if isinstance(options, list):
                    options = json.dumps(options)
                
                q_query = "INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks) VALUES (%s, %s, %s, %s, %s, %s)"
                cursor.execute(q_query, (id, q_text, q_type, options, correct, marks))

            conn.commit()
            conn.close()
            return jsonify({"message": "Exam updated successfully"}), 200
        except mysql.connector.Error as err:
            conn.close()
            return jsonify({"error": str(err)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/exams', methods=['POST'])
def create_exam():
    data = request.json
    title = data.get('title')
    description = data.get('description')
    duration = data.get('duration', 60)
    total_marks = data.get('totalMarks', 100)
    created_by = data.get('createdBy', 1) # Default to admin (ID 1) if not provided
    questions = data.get('questions', [])

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            # 1. Create Exam
            status = data.get('status', 'draft')
            query = "INSERT INTO exams (title, description, duration_minutes, total_marks, created_by, status) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(query, (title, description, duration, total_marks, created_by, status))
            exam_id = cursor.lastrowid

            # 2. Add Questions
            for q in questions:
                q_text = q.get('question_text')
                q_type = q.get('question_type', 'mcq')
                options = q.get('options') # JSON string or list (need to normalize)
                correct = q.get('correct_answer')
                marks = q.get('marks', 1)
                
                # Ensure options is stringified JSON if it's a list
                import json
                if isinstance(options, list):
                    options = json.dumps(options)
                
                q_query = "INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks) VALUES (%s, %s, %s, %s, %s, %s)"
                cursor.execute(q_query, (exam_id, q_text, q_type, options, correct, marks))

            conn.commit()
            conn.close()
            return jsonify({"message": "Exam created successfully", "id": exam_id}), 201
        except mysql.connector.Error as err:
            conn.close()
            return jsonify({"error": str(err)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/exams/<int:id>', methods=['DELETE'])
def delete_exam(id):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM exams WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return jsonify({"message": "Exam deleted successfully"})
        except mysql.connector.Error as err:
             return jsonify({"error": str(err)}), 500
    return jsonify({"error": "Database Error"}), 500

@app.route('/api/messages/<int:user_id>', methods=['GET'])
def get_messages(user_id):
    msg_type = request.args.get('type', 'inbox')
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        
        if msg_type == 'sent':
            # Fetch messages sent BY this user
            # We need to get Receiver Name (if internal) or Email (if external)
            query = """
            SELECT 
                m.id, m.sender_id, m.receiver_id, m.receiver_email, m.subject, m.body, m.is_read, m.status,
                DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%S') as created_at,
                u.firstName, u.lastName, u.email as internalEmail
            FROM messages m
            LEFT JOIN users u ON m.receiver_id = u.id
            WHERE m.sender_id = %s
            ORDER BY m.created_at DESC
            """
        else:
            # Fetch messages received BY this user (Inbox)
            query = """
            SELECT 
                m.id, m.sender_id, m.receiver_id, m.subject, m.body, m.is_read, m.status,
                DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%S') as created_at,
                u.firstName, u.lastName, u.email as senderEmail
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_id = %s
            ORDER BY m.created_at DESC
            """
            
        cursor.execute(query, (user_id,))
        messages = cursor.fetchall()
        conn.close()
        return jsonify(messages)
    return jsonify({"error": "Database connection failed"}), 500

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_smtp_email(to_email, subject, body):
    try:
        config = ConfigParser()
        config.read('db_config.ini')
        
        if 'SMTP' not in config:
            print("SMTP Config missing in db_config.ini")
            return

        smtp_server = config['SMTP'].get('smtp.server', 'smtp.gmail.com')
        smtp_port = int(config['SMTP'].get('smtp.port', 587))
        sender_email = config['SMTP'].get('smtp.email')
        sender_password = config['SMTP'].get('smtp.password')
        
        if not sender_email or not sender_password or 'your_email' in sender_email:
            print("SMTP Credentials not configured.")
            return

        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

@app.route('/api/messages', methods=['POST'])
def send_message():
    data = request.json
    sender_id = data.get('sender_id')
    internal_ids = data.get('receiver_ids', [])
    external_emails = data.get('receiver_emails', [])
    
    # Fallback for old frontend
    if data.get('receiver_id'):
        internal_ids.append(data.get('receiver_id'))

    subject = data.get('subject')
    body = data.get('body')

    if not sender_id or (not internal_ids and not external_emails) or not subject or not body:
        return jsonify({"error": "Missing fields or recipients"}), 400
    
    today = datetime.date.today()
    
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # --- DAILY LIMIT CHECK ---
            cursor.execute("SELECT COUNT(DISTINCT receiver_id) FROM messages WHERE sender_id=%s AND DATE(created_at)=%s AND receiver_id IS NOT NULL", (sender_id, today))
            count_internal = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(DISTINCT receiver_email) FROM messages WHERE sender_id=%s AND DATE(created_at)=%s AND receiver_id IS NULL", (sender_id, today))
            count_external = cursor.fetchone()[0]
            
            current_total = count_internal + count_external
            
            cursor.execute("SELECT DISTINCT receiver_id FROM messages WHERE sender_id=%s AND DATE(created_at)=%s AND receiver_id IS NOT NULL", (sender_id, today))
            existing_ids = {row[0] for row in cursor.fetchall()}
            
            cursor.execute("SELECT DISTINCT receiver_email FROM messages WHERE sender_id=%s AND DATE(created_at)=%s AND receiver_id IS NULL", (sender_id, today))
            existing_emails = {row[0] for row in cursor.fetchall()}
            
            new_ids_count = len([uid for uid in internal_ids if uid not in existing_ids])
            new_emails_count = len([email for email in external_emails if email not in existing_emails])
            
            if current_total + new_ids_count + new_emails_count > 10:
                conn.close()
                return jsonify({
                    "error": f"Daily limit reached (Max 10). You have messaged {current_total} unique people today."
                }), 403

            # --- INSERT MESSAGES (DB) ---
            insert_query = "INSERT INTO messages (sender_id, receiver_id, receiver_email, subject, body) VALUES (%s, %s, %s, %s, %s)"
            values = []
            
            # 1. Internal Users
            for uid in internal_ids:
                values.append((sender_id, uid, None, subject, body))
                
            # 2. External Emails
            for email in external_emails:
                values.append((sender_id, None, email, subject, body))
            
            cursor.execute("DELETE FROM messages WHERE created_at < NOW() - INTERVAL 7 DAY")
            cursor.executemany(insert_query, values)
            conn.commit()
            
            # --- SEND EMAILS (SMTP) ---
            # Fetch emails for internal users
            all_emails = set(external_emails)
            if internal_ids:
                format_strings = ','.join(['%s'] * len(internal_ids))
                cursor.execute(f"SELECT email FROM users WHERE id IN ({format_strings})", tuple(internal_ids))
                result = cursor.fetchall()
                for row in result:
                    if row[0]: # Ensure email is not None
                         all_emails.add(row[0])
            
            # --- EMIT WEBSOCKET EVENT ---
            # Broadcast to all connected clients that a message was sent
            socketio.emit('new_mail', {'recipient_ids': internal_ids})
            
            conn.close()
            
            # Send asynchronously or inline (Inline for now, simple)
            sent_count = 0
            for email in all_emails:
                send_smtp_email(email, subject, body)
                sent_count += 1
            
            return jsonify({
                "message": f"Message saved & sent via Email to {sent_count} recipients."
            }), 201
            
        except mysql.connector.Error as err:
            conn.close()
            return jsonify({"error": str(err)}), 500
    return jsonify({"error": "Database connection failed"}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/exams/<int:id>/assign', methods=['POST'])
def assign_exam(id):
    data = request.json
    student_ids = data.get('student_ids', [])

    if not student_ids:
        return jsonify({"error": "No students selected"}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            # Insert assignment for each student (Check if already assigned first?)
            # For simplicity, we'll use INSERT IGNORE logic or simple INSERT (and handle duplicates if unique constraint exists)
            # Our current schema doesn't force unique (user_id, exam_id), but it should.
            # We'll just insert.
            
            query = "INSERT INTO results (user_id, exam_id, status, score) VALUES (%s, %s, 'pending', 0)"
            values = [(uid, id) for uid in student_ids]
            
            cursor.executemany(query, values)
            conn.commit()
            conn.close()
            return jsonify({"message": f"Assigned to {len(student_ids)} students successfully"}), 200
        except mysql.connector.Error as err:
            conn.close()
            return jsonify({"error": str(err)}), 500
    return jsonify({"error": "Database connection failed"}), 500

# ==========================================
# RESULTS ROUTES
# ==========================================

@app.route('/api/results', methods=['GET'])
def get_results():
    user_id = request.args.get('user_id')
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT 
            r.id, e.title as examTitle, CONCAT(u.firstName, ' ', u.lastName) as studentName,
            r.score, e.total_marks as total, DATE_FORMAT(r.submitted_at, '%Y-%m-%d') as date,
            r.status
        FROM results r
        JOIN exams e ON r.exam_id = e.id
        JOIN users u ON r.user_id = u.id
        """
        params = []
        if user_id:
            query += " WHERE r.user_id = %s"
            params.append(user_id)
        
        query += " ORDER BY r.submitted_at DESC"
        cursor.execute(query, tuple(params))
        results = cursor.fetchall()
        conn.close()
        return jsonify(results)
    return jsonify({"error": "Database Error"}), 500

@app.route('/api/results/<int:id>', methods=['DELETE'])
def delete_result(id):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM results WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return jsonify({"message": "Result deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database Error"}), 500

@app.route('/api/results/<int:id>/download', methods=['GET'])
def download_result(id):
    # This is a placeholder for generating a real PDF or Report
    # For now, it returns successful metadata
    return jsonify({
        "message": "Report generation started",
        "file_url": f"/api/reports/result_{id}.pdf"
    }), 200

# ==========================================
# CLASSES ROUTES
# ==========================================

@app.route('/api/classes', methods=['GET', 'POST'])
def handle_classes():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database Error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    if request.method == 'GET':
        query = """
        SELECT c.*, CONCAT(u.firstName, ' ', u.lastName) as teacher,
        (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as students
        FROM classes c
        LEFT JOIN users u ON c.teacher_id = u.id
        """
        cursor.execute(query)
        classes = cursor.fetchall()
        conn.close()
        return jsonify(classes)
    
    if request.method == 'POST':
        data = request.json
        name = data.get('name')
        teacher_id = data.get('teacher_id')
        code = data.get('class_code')
        desc = data.get('description')
        
        try:
            cursor.execute("INSERT INTO classes (name, teacher_id, class_code, description) VALUES (%s, %s, %s, %s)", 
                           (name, teacher_id, code, desc))
            conn.commit()
            conn.close()
            return jsonify({"message": "Class created"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/classes/<int:id>', methods=['PUT', 'DELETE'])
def handle_single_class(id):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        if request.method == 'PUT':
            data = request.json
            name = data.get('name')
            teacher_id = data.get('teacher_id')
            code = data.get('class_code')
            desc = data.get('description')
            
            try:
                cursor.execute("UPDATE classes SET name = %s, teacher_id = %s, class_code = %s, description = %s WHERE id = %s", 
                               (name, teacher_id, code, desc, id))
                conn.commit()
                conn.close()
                return jsonify({"message": "Class updated successfully"}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500
                
        if request.method == 'DELETE':
            cursor.execute("DELETE FROM classes WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return jsonify({"message": "Class deleted"})
    return jsonify({"error": "Database Error"}), 500

# ==========================================
# LIBRARY ROUTES
# ==========================================

@app.route('/api/library', methods=['GET', 'POST'])
def handle_library():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database Error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    if request.method == 'GET':
        cursor.execute("SELECT * FROM library_resources ORDER BY created_at DESC")
        resources = cursor.fetchall()
        conn.close()
        return jsonify(resources)
    
    if request.method == 'POST':
        data = request.json
        title = data.get('title')
        res_type = data.get('resource_type', 'PDF')
        path = data.get('file_path')
        size = data.get('file_size')
        cat = data.get('category')
        user_id = data.get('uploaded_by')
        
        try:
            cursor.execute("INSERT INTO library_resources (title, resource_type, file_path, file_size, category, uploaded_by) VALUES (%s, %s, %s, %s, %s, %s)", 
                           (title, res_type, path, size, cat, user_id))
            conn.commit()
            conn.close()
            return jsonify({"message": "Resource added"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/library/<int:id>', methods=['DELETE'])
def delete_resource(id):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM library_resources WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return jsonify({"message": "Resource deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database Error"}), 500

@app.route('/api/library/<int:id>/download', methods=['GET'])
def download_resource(id):
    return jsonify({
        "message": "Library resource download started",
        "file_url": f"/api/library/file_{id}.pdf"
    }), 200

# ==========================================
# CALENDAR ROUTES
# ==========================================

@app.route('/api/calendar', methods=['GET', 'POST'])
def handle_calendar():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database Error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    if request.method == 'GET':
        cursor.execute("SELECT id, title, DATE_FORMAT(event_date, '%%Y-%%m-%%d') as date, event_type as type, color, description FROM calendar_events")
        events = cursor.fetchall()
        conn.close()
        return jsonify(events)
    
    if request.method == 'POST':
        data = request.json
        title = data.get('title')
        date = data.get('event_date')
        etype = data.get('event_type')
        color = data.get('color', 'primary')
        uid = data.get('created_by')
        
        try:
            cursor.execute("INSERT INTO calendar_events (title, event_date, event_type, color, created_by) VALUES (%s, %s, %s, %s, %s)", 
                           (title, date, etype, color, uid))
            conn.commit()
            conn.close()
            return jsonify({"message": "Event added"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/calendar/<int:id>', methods=['DELETE'])
def delete_calendar_event(id):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM calendar_events WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return jsonify({"message": "Event deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database Error"}), 500

def create_messages_table():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            # 1. Create Table (with status column)
            query = """
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT, 
                receiver_email VARCHAR(255),
                subject VARCHAR(255),
                body TEXT,
                status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'queued'
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
            )
            """
            cursor.execute(query)
            
            # 2. Alter Table (add status if missing)
            try:
                cursor.execute("SELECT status FROM messages LIMIT 1")
                cursor.fetchall()
            except:
                print("Adding status column...")
                cursor.execute("ALTER TABLE messages ADD COLUMN status VARCHAR(20) DEFAULT 'sent'")

            # (Previous Alters for receiver_email etc...)
            try:
                cursor.execute("SELECT receiver_email FROM messages LIMIT 1")
                cursor.fetchall()
            except:
                cursor.execute("ALTER TABLE messages ADD COLUMN receiver_email VARCHAR(255)")
            
            try:
                 cursor.execute("ALTER TABLE messages MODIFY receiver_id INT NULL")
            except Exception as e:
                print(f"Schema Alter Warning: {e}")

            conn.commit()
            print("Messages table schema updated.")
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Migration Error: {e}")

if __name__ == '__main__':
    create_messages_table()
    socketio.run(app, debug=True, port=5000)
