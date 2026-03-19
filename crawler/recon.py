import asyncio
from playwright.async_api import async_playwright

async def recon_target():
    url = "https://ipd.nat.gov.tw/ipas/certification/AIAP/learning-resources"
    print(f"🕵️ 啟動偵察機，前往目標: {url}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        try:
            await page.goto(url, wait_until="networkidle")
            title = await page.title()
            print(f"✅ 成功抵達！網頁標題為: {title}\n")
            
            print("🔍 正在掃描網頁上的所有連結與按鈕...")
            # 抓取所有的 <a> 標籤文字
            links = await page.eval_on_selector_all("a", "elements => elements.map(e => e.innerText.trim()).filter(t => t.length > 0)")
            
            # 過濾出我們感興趣的關鍵字
            keywords = ["題", "下載", "範例", "pdf", "測驗", "歷屆", "考古", "資源"]
            found_targets = []
            
            for link in set(links):
                if any(kw in link.lower() for kw in keywords):
                    found_targets.append(link)
                    
            if found_targets:
                print("🎯 發現可能是題庫的目標！(高機率為情況 B：檔案下載)")
                for target in found_targets:
                    print(f"  - {target}")
            else:
                print("⚠️ 網頁上沒有找到與「題庫/下載/PDF」明顯相關的連結文字。")
                print("👉 這代表題目可能是直接寫在網頁本文中 (情況 A)。")
                
        except Exception as e:
            print(f"❌ 發生錯誤: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(recon_target())