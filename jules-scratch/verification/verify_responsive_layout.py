import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Get the absolute path to the HTML file
        file_path = os.path.abspath("grafico_intraday_yf_app.html")

        # Mobile view
        await page.set_viewport_size({"width": 375, "height": 812}) # iPhone X viewport
        await page.goto(f"file://{file_path}")
        # Wait for charts to potentially load, although content is static for layout check
        await page.wait_for_timeout(2000)
        await page.screenshot(path="jules-scratch/verification/mobile-view.png")

        # Desktop view
        await page.set_viewport_size({"width": 1280, "height": 720})
        await page.goto(f"file://{file_path}")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="jules-scratch/verification/desktop-view.png")

        await browser.close()

asyncio.run(main())