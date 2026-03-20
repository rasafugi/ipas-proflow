import os
import requests
import pymysql
import asyncio
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 🌟 匯入你寫好的強大解析模組
from hybrid_pipeline import IPASFileParser

# ==========================================
# ⚙️ 系統設定區
# ==========================================
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "popd26318",  # 請確認這是你的 MySQL 密碼
    "database": "ipas_proflow",
    "charset": "utf8mb4"
}

# 這是你要抓取的新考卷 PDF 網址 (請替換成真實網址)
TARGET_PDFS = [
    {
        "url": "https://www.ipas.org.tw/api/proxy/uploads/certification_resource/bf93f438f7be48d295c1b40a34d79f3d/AI%E6%87%89%E7%94%A8%E8%A6%8F%E5%8A%83%E5%B8%AB(%E5%88%9D%E7%B4%9A)-%E5%AD%B8%E7%BF%92%E6%8C%87%E5%BC%95-%E7%A7%91%E7%9B%AE1_%E4%BA%BA%E5%B7%A5%E6%99%BA%E6%85%A7%E5%9F%BA%E7%A4%8E%E6%A6%82%E8%AB%961141203_20251222172144.pdf",
        "rule": "ipas_112_format"
    },
    {
        "url": "https://www.ipas.org.tw/api/proxy/uploads/certification_resource/bf93f438f7be48d295c1b40a34d79f3d/AI%E6%87%89%E7%94%A8%E8%A6%8F%E5%8A%83%E5%B8%AB(%E5%88%9D%E7%B4%9A)-%E5%AD%B8%E7%BF%92%E6%8C%87%E5%BC%95-%E7%A7%91%E7%9B%AE2_%E7%94%9F%E6%88%90%E5%BC%8FAI%E6%87%89%E7%94%A8%E8%88%87%E8%A6%8F%E5%8A%83114123_20251222172159.pdf",
        "rule": "ipas_112_format"
    },
    {
        "url": "https://www.ipas.org.tw/api/proxy/uploads/certification_resource/bf93f438f7be48d295c1b40a34d79f3d/AI%E6%87%89%E7%94%A8%E8%A6%8F%E5%8A%83%E5%B8%AB(%E4%B8%AD%E7%B4%9A)-%E5%AD%B8%E7%BF%92%E6%8C%87%E5%BC%95-%E7%A7%91%E7%9B%AE1%E4%BA%BA%E5%B7%A5%E6%99%BA%E6%85%A7%E6%8A%80%E8%A1%93%E6%87%89%E7%94%A8%E8%A6%8F%E5%8A%83_20251222101833.pdf",
        "rule": "ipas_112_format"
    },
    {
        "url": "https://www.ipas.org.tw/api/proxy/uploads/certification_resource/bf93f438f7be48d295c1b40a34d79f3d/AI%E6%87%89%E7%94%A8%E8%A6%8F%E5%8A%83%E5%B8%AB(%E4%B8%AD%E7%B4%9A)-%E5%AD%B8%E7%BF%92%E6%8C%87%E5%BC%95-%E7%A7%91%E7%9B%AE2%E5%A4%A7%E6%95%B8%E6%93%9A%E8%99%95%E7%90%86%E5%88%86%E6%9E%90%E8%88%87%E6%87%89%E7%94%A8_20251222101850.pdf",
        "rule": "ipas_112_format"
    },
    {
        "url": "https://www.ipas.org.tw/api/proxy/uploads/certification_resource/bf93f438f7be48d295c1b40a34d79f3d/AI%E6%87%89%E7%94%A8%E8%A6%8F%E5%8A%83%E5%B8%AB(%E4%B8%AD%E7%B4%9A)-%E5%AD%B8%E7%BF%92%E6%8C%87%E5%BC%95-%E7%A7%91%E7%9B%AE3%E6%A9%9F%E5%99%A8%E5%AD%B8%E7%BF%92%E6%8A%80%E8%A1%93%E8%88%87%E6%87%89%E7%94%A8_20251222101907.pdf",
        "rule": "ipas_112_format"
    },
    {   
        "url": "https://www.ipas.org.tw/api/proxy/uploads/certification_resource/bf93f438f7be48d295c1b40a34d79f3d/114%E5%B9%B4%E7%AC%AC%E5%9B%9B%E6%A2%AF%E6%AC%A1%E5%88%9D%E7%B4%9AAI%E6%87%89%E7%94%A8%E8%A6%8F%E5%8A%83%E5%B8%AB%E7%AC%AC%E4%B8%80%E7%A7%91%E4%BA%BA%E5%B7%A5%E6%99%BA%E6%85%A7%E5%9F%BA%E7%A4%8E%E6%A6%82%E8%AB%96(%E7%95%B6%E6%AC%A1%E8%A9%A6%E9%A1%8C%E5%85%AC%E5%91%8A114_20251226000442.pdf",
        "rule": "ipas_114_official"
    }
]

# 設定下載路徑，配合你 hybrid_pipeline.py 的預設路徑
DOWNLOAD_DIR = "./downloads"
TEMP_PDF_PATH = os.path.join(DOWNLOAD_DIR, "ipas_exam.pdf")

# ==========================================
# 🛠️ 步驟一：自動下載 PDF (Extract)
# ==========================================
def download_pdf(url, save_path):
    print(f"📥 啟動下載程序，目標網址: {url}")
    
    # 確保 downloads 資料夾存在
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    try:
        # 加入 headers 偽裝成瀏覽器，避免被阻擋
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers, stream=True, timeout=15, verify=False)
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("✅ PDF 下載成功！")
        return True
    except Exception as e:
        print(f"🔴 下載失敗: {e}")
        return False

# ==========================================
# 🛠️ 步驟二：寫入 MySQL 資料庫 (Load)
# ==========================================
def insert_into_db(questions_data):
    if not questions_data:
        print("⚠️ 沒有資料可以寫入資料庫。")
        return

    print(f"📦 準備將 {len(questions_data)} 筆新題目寫入 MySQL 資料庫...")
    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            INSERT INTO questions 
            (original_q_num, question, opt_a, opt_b, opt_c, opt_d, correct_answer, explanation) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            success_count = 0
            for q in questions_data:
                try:
                    cursor.execute(sql, (
                        q["original_q_num"],
                        q["question"],
                        q["options"]["A"],
                        q["options"]["B"],
                        q["options"]["C"],
                        q["options"]["D"],
                        q["correctAnswer"],
                        q.get("explanation", "暫無解析")
                    ))
                    success_count += 1
                except Exception as e:
                    print(f"⚠️ 寫入第 {q['original_q_num']} 題時發生錯誤: {e}")
            
        connection.commit()
        print(f"✅ 完美！成功將 {success_count} 筆新題目新增至資料庫！")
        return success_count

    except Exception as e:
        print(f"🔴 連線資料庫失敗: {e}")
        return 0
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# ==========================================
# 🚀 執行主程式 (批次連發模式)
# ==========================================
def main():
    print(f"🚀 啟動 iPAS 題庫批次更新管線！共發現 {len(TARGET_PDFS)} 個目標網址...")
    total_added = 0
    
    # 🌟 修改迴圈邏輯，讀取指定的 rule
    for index, target in enumerate(TARGET_PDFS, 1):
        url = target["url"]
        rule = target["rule"]
        print(f"\n{'-'*40}")
        print(f"🎯 正在處理第 {index}/{len(TARGET_PDFS)} 份考卷...")
        print(f"🔗 網址: {url}")
        print(f"⚙️ 套用規則: {rule}")
        print(f"{'-'*40}")
        
        if download_pdf(url, TEMP_PDF_PATH):
            # 將 rule_version 傳入解析引擎
            parser = IPASFileParser(download_dir=DOWNLOAD_DIR, rule_version=rule)
            parser.parse_pdf()
            new_questions = parser.questions_data
            
            added_count = insert_into_db(new_questions)
            if added_count:
                total_added += added_count
                
    if os.path.exists(TEMP_PDF_PATH):
        os.remove(TEMP_PDF_PATH)
            
    print(f"\n🎉 批次任務全數執行完畢！你的題庫總共擴充了 {total_added} 道新題目！")

if __name__ == "__main__":
    main()