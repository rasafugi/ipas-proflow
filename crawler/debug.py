import pdfplumber
import os

pdf_path = "./downloads/ipas_exam.pdf"
output_path = "debug_output.txt"

print("🔍 正在把 PDF 轉換為純文字監視檔...")

with pdfplumber.open(pdf_path) as pdf:
    with open(output_path, "w", encoding="utf-8") as f:
        for i, page in enumerate(pdf.pages):
            f.write(f"\n================ PAGE {i+1} ================\n")
            text = page.extract_text()
            if text:
                f.write(text)

print(f"✅ 完成！請打開 {output_path} 查看。")