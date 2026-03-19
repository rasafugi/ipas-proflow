from fastapi import APIRouter, HTTPException
import pymysql
from schemas import UserRegister, UserLogin
from database import get_db_connection

router = APIRouter()

@router.post("/api/register")
def register_user(user: UserRegister):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
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

@router.post("/api/login")
def login_user(user: UserLogin):
    try:
        connection = get_db_connection()
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