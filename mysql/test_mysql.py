import mysql.connector
import time

config = {
    'user': 'root',
    'password': '123123', # Replace with your password
    'host': '172.25.110.76',      # IP of the MySQL Server
    'database': 'test',
    'port': 3306
}

try:
    print(f"--- Connecting to {config['host']}... ---")
    conn = mysql.connector.connect(**config)

    if conn.is_connected():
        print("--- Connection SUCCESSFUL! ---")
        # Get the Process ID of this connection for reference
        cursor = conn.cursor()
        cursor.execute("SELECT CONNECTION_ID()")
        conn_id = cursor.fetchone()[0]
        print(f"MySQL Connection ID: {conn_id}")

        print("--- Keeping connection ESTABLISHED for 600 seconds... ---")
        print("Now open another Terminal and type: netstat -anp | grep :3306")

        # Run a loop to keep the script from exiting immediately, allowing us to check the connection status with netstat
        # Every 30 seconds, execute a simple query to prevent timeout (Keep-alive)
        for i in range(20):
            cursor.execute("SELECT 1")
            cursor.fetchall()
            time.sleep(30)

except Exception as e:
    print(f"Error occurred: {e}")

finally:
    if 'conn' in locals() and conn.is_connected():
        conn.close()
        print("--- Connection CLOSED. ---")