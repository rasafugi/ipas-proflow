import asyncio
import re
import json
import os
import pdfplumber

class IPASFileParser:
    def __init__(self, download_dir="./downloads"):
        self.download_dir = download_dir
        self.pdf_path = os.path.join(self.download_dir, "ipas_exam.pdf")
        self.questions_data = []

    def parse_pdf(self):
        print(f"🧩 啟動 pdfplumber，開始解析文件: {self.pdf_path}")
        if not os.path.exists(self.pdf_path):
            print("❌ 找不到 PDF 檔案！")
            return

        raw_text = ""
        with pdfplumber.open(self.pdf_path) as pdf:
            print("✂️ 正在裁切 PDF，直接跳過前 25 頁的無效課文...")
            for page in pdf.pages[25:]:
                text = page.extract_text()
                if text:
                    raw_text += text + "\n"
        
        print("🧹 啟動進階數據清洗，修復 PDF 隱形黏貼問題...")
        # 1. 消除頁首與頁尾雜訊
        clean_text = re.sub(r'[^\n]*[^\n]*\n', '\n', raw_text)
        clean_text = re.sub(r'\n\s*[A-Za-z0-9]+-\d+\s*\n', '\n', clean_text)
        
        # 2. 🌟 教授的獨門清洗術：強制斷行！
        # 如果句號後面緊接著數字章節 (如 "產品。3.3") 或特定關鍵字，強制插入斷行符號
        clean_text = re.sub(r'([。！？])\s*(\d+\.\d+)', r'\1\n\2', clean_text)
        clean_text = re.sub(r'([。！？])\s*(大數據|參考文獻)', r'\1\n\2', clean_text)
        
        print("✅ 清洗完成！啟動防偽版 Regex 魔法陣...")
        
        # ==========================================
        # 🎯 魔法陣 1：題目抓取 (新增防偽標籤)
        # ==========================================
        q_pattern = re.compile(
            r'(?:^|\n)\s*(\d+)\.\s+'                       
            r'(?!Ans)'                                     
            # 🛑 核心防禦：題目到 (A) 之間，絕對不允許出現跨行的下一個數字 (例如 \n2.)！
            r'((?:(?![\(（]A[\)）]|\n\s*\d+\.).)*?)'                  
            r'[\(（]A[\)）]\s*((?:(?![\(（]B[\)）]|\n\s*\d+\.).)*?)'   
            r'[\(（]B[\)）]\s*((?:(?![\(（]C[\)）]|\n\s*\d+\.).)*?)'   
            r'[\(（]C[\)）]\s*((?:(?![\(（]D[\)）]|\n\s*\d+\.).)*?)'   
            r'[\(（]D[\)）]\s*(.*?)\s*'                    
            r'(?=\n\s*\d+\.\s|\n\s*\d+\.\s*Ans|$)',        
            re.DOTALL
        )
        
        q_matches = q_pattern.findall(clean_text)
        questions_list = []
        global_id = 1 

        for match in q_matches:
            questions_list.append({
                "id": global_id,
                "original_q_num": int(match[0]),
                "question": match[1].replace('\n', '').strip(),
                "options": {
                    "A": match[2].replace('\n', '').strip(),
                    "B": match[3].replace('\n', '').strip(),
                    "C": match[4].replace('\n', '').strip(),
                    "D": match[5].replace('\n', '').strip()
                },
                "correctAnswer": "A", 
                "explanation": "暫無解析"
            })
            global_id += 1

        # ==========================================
        # 🎯 魔法陣 2：解答抓取 (防彈升級版)
        # ==========================================
        ans_pattern = re.compile(
            r'(?:^|\n)\s*(\d+)\.\s*Ans\s*[\(（]([A-D])[\)）]' # 1. 抓取題號與答案
            r'[^\n]*'                                       # 2. 忽略答案同行的標題(例如 Word2Vec)
            r'(?:\n\s*解析[：:]\s*)?'                         # 3. 吸收換行與「解析：」(這幾個字可有可無)
            r'((?:(?!\n\s*\d+\.\s*Ans|\n\s*\d+\.\d+|\n\s*大數據|\n\s*參考文獻).)*)', # 4. 抓取詳解內容
            re.DOTALL
        )
        
        ans_matches = ans_pattern.findall(clean_text)

        # 🌟 教授的防錯大絕招：改用「字典對應」取代「拉鍊配對」
        ans_dict = {}
        for m in ans_matches:
            q_num = int(m[0])
            exp_text = m[2].replace('\n', '').strip()
            
            ans_dict[q_num] = {
                "ans": m[1].strip(), 
                # 如果官方剛好這題沒給詳解，我們就塞預設文字
                "exp": exp_text if exp_text else "官方試卷未提供解析"
            }

        paired_count = 0
        for q in questions_list:
            q_num = q["original_q_num"]
            if q_num in ans_dict:
                q["correctAnswer"] = ans_dict[q_num]["ans"]
                q["explanation"] = ans_dict[q_num]["exp"]
                paired_count += 1

        self.questions_data = questions_list
        
        print(f"🎯 題目解析完成！共精準抽取了 {len(self.questions_data)} 題。")
        print(f"🔗 解答循序配對完成！成功結合了 {paired_count} 題的答案與解析。")

    def export_json(self):
        if not self.questions_data:
            return
            
        output_file = "ipas_questions.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.questions_data, f, ensure_ascii=False, indent=2)
            
        print(f"💾 完美！修復後的無雜訊題庫已匯出至 {output_file}！")

if __name__ == "__main__":
    parser = IPASFileParser()
    parser.parse_pdf()
    parser.export_json()