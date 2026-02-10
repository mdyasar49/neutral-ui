import mysql.connector
from configparser import ConfigParser

def get_db_connection():
    config = ConfigParser()
    config.read('backend/db_config.ini')
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

def create_messages_table():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                subject VARCHAR(255),
                body TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """)
            conn.commit()
            print("Messages table created successfully!")
            
            # Insert a welcome message
            cursor.execute("SELECT id FROM users WHERE role='admin' LIMIT 1")
            admin = cursor.fetchone()
            if admin:
                cursor.execute("""
                    INSERT INTO messages (sender_id, receiver_id, subject, body) 
                    VALUES (%s, %s, 'Welcome to Mail', 'This is your first message in the new Mail system.')
                """, (admin[0], admin[0]))
                conn.commit()
                print("Welcome message sent.")
                
        except mysql.connector.Error as err:
            print(f"Error creating table: {err}")
        finally:
            conn.close()

if __name__ == "__main__":
    create_messages_table()
