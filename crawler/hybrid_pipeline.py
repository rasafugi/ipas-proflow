import os
import re
import json
import pdfplumber

class IPASFileParser:
    def __init__(self, download_dir="./downloads", rule_version="ipas_114_official"):
        self.download_dir = download_dir
        self.pdf_path = os.path.join(self.download_dir, "ipas_exam.pdf")
        self.questions_data = []
        
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
            return

        print(f"🧩 啟動 pdfplumber，開始解析文件: {self.pdf_path}")
        if not os.path.exists(self.pdf_path):
            print("❌ 找不到 PDF 檔案！")
            return

        raw_text = ""
        with pdfplumber.open(self.pdf_path) as pdf:
            start_anchor = self.rules.get("start_anchor", "")
            is_awake = False if start_anchor else True

            if start_anchor:
                print(f"👁️ 爬蟲進入休眠模式，尋找起點：【{start_anchor}】...")

            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if not text:
                    continue
                
                if not is_awake:
                    if start_anchor in text:
                        print(f"🎯 發現起點於第 {i+1} 頁！爬蟲甦醒！")
                        is_awake = True
                        raw_text += text + "\n"
                else:
                    raw_text += text + "\n"
        
        print("🧹 啟動進階數據清洗...")
        clean_text = raw_text
        for rule in self.rules.get("cleaning_rules", []):
            clean_text = re.sub(rule["pattern"], rule["repl"], clean_text)
        
        print("✅ 啟動動態 Regex 魔法陣 (命名群組升級版)...")
        
        q_pattern = re.compile(self.rules["question_pattern"], re.DOTALL)
        questions_list = []
        global_id = 1 

        for match in q_pattern.finditer(clean_text):
            d = match.groupdict() # 🌟 取得所有命名群組
            
            q_num = d.get("q_num", global_id)
            question_text = d.get("question", "").replace('\n', '').strip()
            
            # 取得選項，並過濾掉 114 公告試題中出現的「；」全形分號
            opt_a = d.get("A", "").replace('\n', '').replace('；', '').strip()
            opt_b = d.get("B", "").replace('\n', '').replace('；', '').strip()
            opt_c = d.get("C", "").replace('\n', '').replace('；', '').strip()
            opt_d = d.get("D", "").replace('\n', '').replace('；', '').strip()
            
            # 取得行內答案 (將可能的全形 Ｃ 轉換為半形 C，並轉大寫)
            inline_ans = d.get("ans", "A").replace('\n', '').strip().upper()
            inline_ans = inline_ans.translate(str.maketrans('ＡＢＣＤ', 'ABCD'))
            
            questions_list.append({
                "id": global_id,
                "original_q_num": int(q_num),
                "question": question_text,
                "options": {
                    "A": opt_a, "B": opt_b, "C": opt_c, "D": opt_d
                },
                "correctAnswer": inline_ans, 
                "explanation": "官方試卷未提供解析"
            })
            global_id += 1

        # 🌟 如果有設定獨立的解答區塊 (如 112 年格式)，則覆蓋行內預設值
        if self.rules.get("answer_pattern"):
            ans_pattern = re.compile(self.rules["answer_pattern"], re.DOTALL)
            ans_dict = {}
            for m in ans_pattern.finditer(clean_text):
                d = m.groupdict()
                q_num = int(d.get("q_num"))
                ans_dict[q_num] = {
                    "ans": d.get("ans", "A").strip().upper().translate(str.maketrans('ＡＢＣＤ', 'ABCD')), 
                    "exp": d.get("exp", "").replace('\n', '').strip() or "官方試卷未提供解析"
                }

            for q in questions_list:
                if q["original_q_num"] in ans_dict:
                    q["correctAnswer"] = ans_dict[q["original_q_num"]]["ans"]
                    q["explanation"] = ans_dict[q["original_q_num"]]["exp"]
            print("🔗 獨立解答區塊配對完成！")

        self.questions_data = questions_list
        print(f"🎯 題目解析完成！共精準抽取了 {len(self.questions_data)} 題。")