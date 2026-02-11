import mysql.connector
from configparser import ConfigParser

def get_db_connection():
    config = ConfigParser()
    config.read('db_config.ini')
    db_config = config['DatabaseSection']
    connection = mysql.connector.connect(
        host=db_config['database.host'],
        user=db_config['database.user'],
        password=db_config['database.password'],
        database=db_config['database.dbname'],
        auth_plugin=db_config['database.auth_plugin']
    )
    return connection

print("--- USERS ---")
conn = get_db_connection()
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT id, firstName, email, role FROM users")
for row in cursor.fetchall():
    print(row)

print("\n--- MESSAGES ---")
cursor.execute("SELECT id, sender_id, receiver_id, receiver_email, subject FROM messages")
for row in cursor.fetchall():
    print(row)
conn.close()
