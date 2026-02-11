from app import get_db_connection
import json

def check_messages():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM messages")
        msgs = cursor.fetchall()
        print(f"Total messages: {len(msgs)}")
        for m in msgs:
            print(m)
        conn.close()

if __name__ == "__main__":
    check_messages()
