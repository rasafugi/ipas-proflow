import asyncio
import re
import json
import os
import pdfplumber

class IPASFileParser:
    # 🌟 新增 rule_version 參數，預設使用 112 年格式
    def __init__(self, download_dir="./downloads", rule_version="ipas_112_format"):
        self.download_dir = download_dir
        self.pdf_path = os.path.join(self.download_dir, "ipas_exam.pdf")
        self.questions_data = []
        
        # 🌟 啟動時自動讀取外部規則庫 (JSON)
        config_path = os.path.join(os.path.dirname(__file__), "config", "regex_rules.json")
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                all_rules = json.load(f)
                if rule_version not in all_rules:
                    raise ValueError(f"找不到指定的解析規則：{rule_version}")
                self.rules = all_rules[rule_version]
                print(f"⚙️ 成功載入解析規則模組：{self.rules['description']}")
        except Exception as e:
            print(f"❌ 讀取規則庫失敗: {e}")
            self.rules = None

    def parse_pdf(self):
        if not self.rules:
            print("❌ 缺少解析規則，任務終止。")
            return

        print(f"🧩 啟動 pdfplumber，開始解析文件: {self.pdf_path}")
        if not os.path.exists(self.pdf_path):
            print("❌ 找不到 PDF 檔案！")
            return

        raw_text = ""
        with pdfplumber.open(self.pdf_path) as pdf:
            # 🌟 從 JSON 設定檔讀取起點錨點
            start_anchor = self.rules.get("start_anchor", "")
            # 如果有設定錨點，預設為休眠模式 (False)；如果沒設定，就直接甦醒 (True)
            is_awake = False if start_anchor else True

            if start_anchor:
                print(f"👁️ 爬蟲進入休眠掃描模式，正在尋找起點標記：【{start_anchor}】...")
            else:
                print("👁️ 爬蟲全局掃描模式啟動...")

            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if not text:
                    continue
                
                # 如果還在休眠狀態，檢查這頁有沒有出現「起點標記」
                if not is_awake:
                    if start_anchor in text:
                        print(f"🎯 發現起點標記於第 {i+1} 頁！爬蟲甦醒，開始擷取考題...")
                        is_awake = True  # 切換為甦醒狀態
                        raw_text += text + "\n"
                
                # 如果已經是甦醒狀態，就把這頁的文字吃進來
                else:
                    raw_text += text + "\n"
        
        print("🧹 啟動進階數據清洗，套用動態規則...")
        clean_text = raw_text
        
        # 🌟 動態執行清洗規則
        for rule in self.rules["cleaning_rules"]:
            clean_text = re.sub(rule["pattern"], rule["repl"], clean_text)
        
        print("✅ 清洗完成！啟動動態 Regex 魔法陣...")
        
        # ==========================================
        # 🎯 魔法陣 1：動態題目抓取
        # ==========================================
        # 從 JSON 中讀取正則表達式並編譯
        q_pattern = re.compile(self.rules["question_pattern"], re.DOTALL)
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
                "explanation": "官方試卷未提供解析"
            })
            global_id += 1

        # ==========================================
        # 🎯 魔法陣 2：動態解答抓取與配對
        # ==========================================
        ans_pattern = re.compile(self.rules["answer_pattern"], re.DOTALL)
        ans_matches = ans_pattern.findall(clean_text)

        ans_dict = {}
        for m in ans_matches:
            q_num = int(m[0])
            exp_text = m[2].replace('\n', '').strip()
            ans_dict[q_num] = {
                "ans": m[1].strip(), 
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

if __name__ == "__main__":
    parser = IPASFileParser()
    parser.parse_pdf()