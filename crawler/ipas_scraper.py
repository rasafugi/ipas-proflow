import asyncio
import json
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

class IPASQuestionCrawler:
    def __init__(self, target_url):
        self.target_url = target_url
        self.questions_data = [] # 用來儲存最後清洗好的 JSON 資料

    async def fetch_html(self):
        """啟動瀏覽器並獲取動態渲染後的網頁原始碼"""
        print(f"🚀 啟動 Playwright 引擎，準備前往: {self.target_url}")
        
        async with async_playwright() as p:
            # headless=False 可以讓你在開發期看到瀏覽器實際的操作畫面，上線時改為 True
            browser = await p.chromium.launch(headless=False)
            
            # 建立一個新的瀏覽器情境，並加入防阻擋的 User-Agent
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()

            try:
                # 前往目標網站，等待網路請求靜止 (networkidle) 代表動態內容已載入完畢
                await page.goto(self.target_url, wait_until="networkidle", timeout=30000)
                
                # 💡 教授提示：如果有分頁按鈕或展開詳解的按鈕，我們可以在這裡寫 page.click()
                # await page.click('.show-answer-btn')
                # await page.wait_for_timeout(1000) # 等待動畫或資料載入

                # 獲取最終的 HTML DOM 結構
                html_content = await page.content()
                print("✅ 成功獲取動態渲染後的 HTML！")
                return html_content

            except Exception as e:
                print(f"❌ 獲取網頁失敗: {e}")
                return None
            finally:
                await browser.close()

    def parse_data(self, html):
        """使用 BeautifulSoup 解析 DOM 並萃取題目結構"""
        if not html:
            return

        print("🧩 開始使用 BeautifulSoup 萃取資料...")
        soup = BeautifulSoup(html, 'lxml')

        # ---------------------------------------------------------
        # ⚠️ 這裡需要根據目標網站的實際 HTML 結構 (Class/ID) 進行調整
        # 以下為假設的萃取邏輯範例：
        # ---------------------------------------------------------
        
        '''
        question_blocks = soup.find_all('div', class_='question-item')
        
        for index, block in enumerate(question_blocks):
            question_text = block.find('h3', class_='q-title').text.strip()
            
            # 抓取選項
            options_dict = {}
            options_elements = block.find_all('li', class_='q-option')
            for opt in options_elements:
                key = opt.find('span', class_='opt-key').text.strip() # 例: 'A'
                value = opt.find('span', class_='opt-text').text.strip() # 例: '線性迴歸'
                options_dict[key] = value
                
            # 抓取解答與詳解
            correct_answer = block.find('div', class_='correct-ans').text.strip()
            explanation = block.find('div', class_='q-explanation').text.strip()

            # 組裝成我們的 React 前端需要的格式
            formatted_q = {
                "id": index + 1,
                "question": question_text,
                "options": options_dict,
                "correctAnswer": correct_answer,
                "explanation": explanation
            }
            self.questions_data.append(formatted_q)
        '''
        print("⚠️ 提醒：請替換 parse_data 內的 CSS 選擇器邏輯")

    def export_to_json(self, filename="ipas_questions.json"):
        """將清洗後的資料匯出為 JSON 檔案"""
        if not self.questions_data:
            print("📭 沒有資料可以匯出。")
            return

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.questions_data, f, ensure_ascii=False, indent=2)
        print(f"💾 資料已成功匯出至 {filename}，共 {len(self.questions_data)} 題。")

    async def run(self):
        """執行爬蟲主流程"""
        html = await self.fetch_html()
        self.parse_data(html)
        # 測試期間先不匯出空檔案，等寫好解析邏輯再解開註解
        # self.export_to_json()


# 測試執行區塊
if __name__ == "__main__":
    # 將這裡替換成你要抓取題庫的真實網址
    TARGET_URL = "https://example.com/ipas-questions" 
    
    crawler = IPASQuestionCrawler(TARGET_URL)
    asyncio.run(crawler.run())