from fastapi import APIRouter, HTTPException
from schemas import TestRecord
from database import get_db_connection

router = APIRouter()

@router.post("/api/submit_test")
def submit_test(record: TestRecord):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "INSERT INTO test_records (user_code, score, correct_count, total_questions) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (record.user_code, record.score, record.correct_count, record.total_questions))
        connection.commit()
        return {"status": "success", "message": "成績儲存成功！"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"儲存成績失敗: {str(e)}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@router.get("/api/leaderboard")
def get_leaderboard():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
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

@router.get("/api/my_records/{user_code}")
def get_my_records(user_code: str):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT score, correct_count, created_at FROM test_records WHERE user_code = %s ORDER BY created_at ASC"
            cursor.execute(sql, (user_code,))
            results = cursor.fetchall()
            for row in results:
                row['created_at'] = row['created_at'].strftime("%m-%d %H:%M")
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取個人戰績失敗: {str(e)}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()