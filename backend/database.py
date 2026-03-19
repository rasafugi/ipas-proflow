import pymysql

# 🌟 資料庫連線設定 (你的專屬密碼 popd26318 已經帶入)
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "popd26318",
    "database": "ipas_proflow",
    "cursorclass": pymysql.cursors.DictCursor
}

# 建立一個獲取連線的共用函數
def get_db_connection():
    return pymysql.connect(**DB_CONFIG)