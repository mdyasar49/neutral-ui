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

conn = get_db_connection()
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM messages")
for row in cursor.fetchall():
    print(row)
conn.close()
