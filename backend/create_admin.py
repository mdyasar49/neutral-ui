import mysql.connector
from configparser import ConfigParser
import bcrypt

def create_admin():
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

        cursor = connection.cursor()
        
        # Check if admin already exists
        cursor.execute("SELECT * FROM users WHERE email = 'admin@neutral.com'")
        existing_admin = cursor.fetchone()
        
        password = 'password123'
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        if existing_admin:
            print("Admin already exists. Updating password to 'password123'...")
            query = "UPDATE users SET password = %s WHERE email = 'admin@neutral.com'"
            cursor.execute(query, (hashed_password,))
        else:
            print("Creating new admin user...")
            query = "INSERT INTO users (firstName, lastName, email, password, role) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(query, ('System', 'Admin', 'admin@neutral.com', hashed_password, 'admin'))
            
        connection.commit()
        print(f"Success! You can login with:\nEmail: admin@neutral.com\nPassword: {password}")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    create_admin()
