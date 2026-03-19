from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymysql

app = FastAPI(title="iPAS ProFlow 測驗系統 API")

# CORS 設定 (允許前端跨域請求)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 資料庫連線設定 (確認密碼是你設定的 123456)
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "popd26318",
    "database": "ipas_proflow",
    "cursorclass": pymysql.cursors.DictCursor
}

# ==========================================
# 📦 定義前端傳來的資料格式 (Pydantic Models)
# ==========================================
class UserRegister(BaseModel):
    user_code: str
    email: str
    password: str
    nickname: str
    avatar: str = None  # 儲存 Base64 圖片字串

class UserLogin(BaseModel):
    email: str
    password: str

class TestRecord(BaseModel):
    user_code: str
    score: int
    correct_count: int
    total_questions: int = 20

# ==========================================
# 🚀 API 端點實作
# ==========================================

@app.get("/")
def read_root():
    return {"message": "iPAS ProFlow API 伺服器運作中 🟢"}

# 🎯 API 1：註冊新玩家 (升級版)
@app.post("/api/register")
def register_user(user: UserRegister):
    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            # 💡 教授的業界實務提醒：在真實專案中，密碼絕對不能存明碼，必須經過 Hash (如 bcrypt) 加密！
            # 這裡為了展示全端串接流程，我們先以明碼儲存。
            sql = """
            INSERT INTO users (user_code, email, password, nickname, avatar) 
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (user.user_code, user.email, user.password, user.nickname, user.avatar))
        connection.commit()
        return {"status": "success", "message": "註冊成功！"}
    except pymysql.err.IntegrityError:
        raise HTTPException(status_code=400, detail="這個信箱已經被註冊過囉！")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"註冊失敗: {str(e)}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# 🎯 API 1.5：玩家登入 (全新功能)
@app.post("/api/login")
def login_user(user: UserLogin):
    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            sql = "SELECT user_code, email, nickname, avatar FROM users WHERE email = %s AND password = %s"
            cursor.execute(sql, (user.email, user.password))
            result = cursor.fetchone()
            
            if result:
                return {"status": "success", "data": result}
            else:
                raise HTTPException(status_code=401, detail="信箱或密碼錯誤！")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"登入失敗: {str(e)}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# 🎯 API 2：儲存測驗成績
@app.post("/api/submit_test")
def submit_test(record: TestRecord):
    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            INSERT INTO test_records (user_code, score, correct_count, total_questions) 
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (record.user_code, record.score, record.correct_count, record.total_questions))
        connection.commit()
        return {"status": "success", "message": "成績儲存成功！"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"儲存成績失敗: {str(e)}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# 🎯 API 3：獲取榮譽排行榜 (升級版：過濾重複，只顯示個人最高分)
@app.get("/api/leaderboard")
def get_leaderboard():
    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            # 🌟 教授的 SQL 魔法：使用 GROUP BY 把同一個玩家的紀錄綁在一起
            # 然後用 MAX(t.score) 挑出他所有考試紀錄中的最高分！
            sql = """
            SELECT u.nickname, u.avatar, MAX(t.score) as score, MAX(t.created_at) as created_at 
            FROM test_records t
            JOIN users u ON t.user_code = u.user_code
            GROUP BY u.user_code, u.nickname, u.avatar
            ORDER BY score DESC, created_at DESC
            LIMIT 10
            """
            cursor.execute(sql)
            results = cursor.fetchall()
            
            for row in results:
                row['created_at'] = row['created_at'].strftime("%Y-%m-%d %H:%M")
                
        return {"status": "success", "data": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取排行榜失敗: {str(e)}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# 🎯 API 4：即時隨機抽題 (預設抽 20 題)
@app.get("/api/questions/random")
def get_random_questions(limit: int = 20):
    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            # SQL 魔法：ORDER BY RAND() 可以讓資料庫隨機打亂順序，LIMIT 限制抓取數量
            sql = "SELECT * FROM questions ORDER BY RAND() LIMIT %s"
            cursor.execute(sql, (limit,))
            results = cursor.fetchall()
            
            # 將資料庫扁平的欄位，重新包裝成前端 React 習慣的巢狀結構
            formatted_questions = []
            for row in results:
                formatted_questions.append({
                    "id": row["id"],
                    "original_q_num": row["original_q_num"],
                    "question": row["question"],
                    "options": {
                        "A": row["opt_a"],
                        "B": row["opt_b"],
                        "C": row["opt_c"],
                        "D": row["opt_d"]
                    },
                    "correctAnswer": row["correct_answer"],
                    "explanation": row["explanation"]
                })
                
        return {"status": "success", "data": formatted_questions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取考題失敗: {str(e)}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# 🎯 API 5：獲取個人歷史戰績
@app.get("/api/my_records/{user_code}")
def get_my_records(user_code: str):
    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            # 撈取該使用者的所有測驗紀錄，按時間先後排序 (ASC，適合畫時間軸折線圖)
            sql = """
            SELECT score, correct_count, created_at 
            FROM test_records 
            WHERE user_code = %s 
            ORDER BY created_at ASC
            """
            cursor.execute(sql, (user_code,))
            results = cursor.fetchall()
            
            # 把時間格式轉換成「月-日 時:分」，讓圖表的 X 軸比較乾淨
            for row in results:
                row['created_at'] = row['created_at'].strftime("%m-%d %H:%M")
                
        return {"status": "success", "data": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取個人戰績失敗: {str(e)}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()