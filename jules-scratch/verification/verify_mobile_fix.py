from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        # Define a mobile viewport from a known device
        pixel_4 = p.devices['Pixel 4']
        browser = p.chromium.launch()
        context = browser.new_context(**pixel_4)
        page = context.new_page()

        # Get the absolute path to the local HTML file
        file_path = os.path.abspath('grafico_intraday_yf_app.html')

        # Navigate to the local file using the file:// protocol
        page.goto(f'file://{file_path}')

        # Wait for the price chart to be visible to ensure it has loaded
        # The chart can take a moment to render, especially with external dependencies
        page.wait_for_selector('#priceChart', timeout=30000) # Increased timeout to 30s

        # Take a screenshot to visually verify the page
        page.screenshot(path='jules-scratch/verification/verification.png')

        # Clean up
        browser.close()

if __name__ == '__main__':
    run()