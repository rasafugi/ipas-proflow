from fastapi import APIRouter, HTTPException
from database import get_db_connection

router = APIRouter()

@router.get("/api/questions/random")
def get_random_questions(limit: int = 20):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM questions ORDER BY RAND() LIMIT %s"
            cursor.execute(sql, (limit,))
            results = cursor.fetchall()
            
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