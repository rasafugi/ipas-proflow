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
        # 🎯 魔法陣 2：解答抓取 (改良版煞車系統)
        # ==========================================
        ans_pattern = re.compile(
            r'(?:^|\n)\s*(\d+)\.\s*Ans\s*[\(（]([A-D])[\)）]\s*解析[：:]\s*'
            # 🛑 煞車系統：遇到下一題、章節號(3.3)、或參考文獻，立刻停止！
            r'((?:(?!\n\s*\d+\.\s|\n\s*\d+\.\d+|\n\s*大數據|\n\s*參考文獻).)*)', 
            re.DOTALL
        )
        
        ans_matches = ans_pattern.findall(clean_text)

        # 拉鍊式配對 (Zip)
        paired_count = 0
        pair_limit = min(len(questions_list), len(ans_matches))

        for i in range(pair_limit):
            questions_list[i]["correctAnswer"] = ans_matches[i][1].strip()
            questions_list[i]["explanation"] = ans_matches[i][2].replace('\n', '').strip()
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