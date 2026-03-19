import json
import pymysql
import os

# 資料庫連線設定
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "popd26318",  # 確認你的密碼
    "database": "ipas_proflow",
    "charset": "utf8mb4"
}

def seed_questions():
    # 讀取 JSON 檔案
    json_path = "ipas_questions.json"
    
    if not os.path.exists(json_path):
        print(f"❌ 找不到 {json_path}！請確認檔案是否有放在 backend 資料夾中。")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        questions_data = json.load(f)

    print(f"📦 成功讀取 JSON，共 {len(questions_data)} 題。準備灌入 MySQL...")

    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            # 先清空原本的資料表 (以防你重複執行腳本，導致題目變 80 題)
            cursor.execute("TRUNCATE TABLE questions")
            
            # 準備新增資料的 SQL 語法
            sql = """
            INSERT INTO questions 
            (original_q_num, question, opt_a, opt_b, opt_c, opt_d, correct_answer, explanation) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # 批次把每一題寫入資料庫
            for q in questions_data:
                cursor.execute(sql, (
                    q["original_q_num"],
                    q["question"],
                    q["options"]["A"],
                    q["options"]["B"],
                    q["options"]["C"],
                    q["options"]["D"],
                    q["correctAnswer"],
                    q["explanation"]
                ))
            
        connection.commit()
        print(f"✅ 完美！40 題考古題已經成功轉移到 MySQL 資料庫！")

    except Exception as e:
        print(f"🔴 資料庫寫入失敗: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

if __name__ == "__main__":
    seed_questions()