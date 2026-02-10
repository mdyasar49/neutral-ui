import mysql.connector
from configparser import ConfigParser

def update_db():
    config = ConfigParser()
    config.read('db_config.ini')
    db_config = config['DatabaseSection']

    try:
        conn = mysql.connector.connect(
            host=db_config['database.host'],
            user=db_config['database.user'],
            password=db_config['database.password'],
            database=db_config['database.dbname'],
            auth_plugin=db_config.get('database.auth_plugin', 'mysql_native_password')
        )
        cursor = conn.cursor()
        
        print("Checking messages table...")
        
        # 1. Make receiver_id nullable
        cursor.execute("ALTER TABLE messages MODIFY receiver_id INT NULL")
        print("Updated receiver_id to be nullable")
        
        # 2. Add receiver_email column
        try:
            cursor.execute("ALTER TABLE messages ADD COLUMN receiver_email VARCHAR(255) NULL AFTER receiver_id")
            print("Added receiver_email column")
        except:
            print("receiver_email column might already exist")
            
        # 3. Add status column
        try:
            cursor.execute("ALTER TABLE messages ADD COLUMN status ENUM('sent', 'failed') DEFAULT 'sent' AFTER is_read")
            print("Added status column")
        except:
            print("status column might already exist")
            
        conn.commit()
        conn.close()
        print("Database update complete!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_db()
