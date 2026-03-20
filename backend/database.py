import pymysql
import os
from dotenv import load_dotenv

# 🌟 載入 .env 檔案中的環境變數
load_dotenv()

# 動態讀取變數，如果在雲端就讀取雲端的，在本機就讀取本機的
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "cursorclass": pymysql.cursors.DictCursor
}

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)