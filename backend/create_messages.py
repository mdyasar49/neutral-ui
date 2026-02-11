import mysql.connector
from configparser import ConfigParser

def get_db_connection():
    config = ConfigParser()
    config.read('db_config.ini')

    if 'DatabaseSection' not in config:
        print("Error: db_config.ini not found or missing DatabaseSection")
        return None

    db_config = config['DatabaseSection']

    try:
        connection = mysql.connector.connect(
            host=db_config['database.host'],
            user=db_config['database.user'],
            password=db_config['database.password'],
            database=db_config['database.dbname'],
            auth_plugin=db_config.get('database.auth_plugin', 'mysql_native_password')
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def create_messages_table():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            # Create Table
            cursor.execute("""
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
                created_by INT,
                modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                modified_by INT,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
            )
            """)
            conn.commit()
            print("Messages table created successfully!")
            
            # Create Admin Message
            cursor.execute("SELECT id FROM users WHERE role='admin' LIMIT 1")
            admin = cursor.fetchone()
            
            if admin:
                cursor.execute("""
                    INSERT IGNORE INTO messages (sender_id, receiver_id, subject, body, is_read, created_by) 
                    VALUES (%s, %s, 'Welcome to Mail', 'Congratulations on setting up the Mail System! You can now send internal messages to students.', FALSE, %s)
                """, (admin[0], admin[0], 'System'))
                conn.commit()
                print("Welcome message sent to Admin.")
                
        except mysql.connector.Error as err:
            print(f"Error creating table: {err}")
        finally:
            conn.close()

if __name__ == "__main__":
    create_messages_table()
