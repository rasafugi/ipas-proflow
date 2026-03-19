from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 🌟 引入我們剛剛寫好的 Router 模組
from routers import auth, questions, records

app = FastAPI(title="iPAS ProFlow 測驗系統 API (模組化升級版)")

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🌟 將所有子路由掛載到主程式上
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(records.router)

@app.get("/")
def read_root():
    return {"message": "iPAS ProFlow API 伺服器運作中 🟢 (模組化架構)"}