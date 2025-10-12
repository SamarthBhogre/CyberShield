import mysql.connector

def get_db_connection():
    conn = mysql.connector.connect(
    host='localhost',
    port=3306,
    user='root',
    password='Samarth#05',
    database='cybershield'
)
    return conn
