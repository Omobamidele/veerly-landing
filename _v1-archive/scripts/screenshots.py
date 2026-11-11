"""Capture preview screenshots. Usage: python3 scripts/screenshots.py [base_url]"""
import sys
from playwright.sync_api import sync_playwright
base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3210"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    def page(w, h, mobile=False):
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2 if mobile else 1,
                            is_mobile=mobile, has_touch=mobile, reduced_motion="reduce")
        pg = ctx.new_page(); pg.goto(base, wait_until="networkidle"); pg.evaluate("document.fonts.ready")
        pg.evaluate("""async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); }""")
        pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(800)
        return pg
    pg = page(1440, 900); pg.screenshot(path="screenshots/hero.png"); pg.screenshot(path="screenshots/desktop.png", full_page=True)
    # overflow check
    print("desktop overflow:", pg.evaluate("document.documentElement.scrollWidth - innerWidth"))
    pg = page(390, 844, True); pg.screenshot(path="screenshots/mobile.png", full_page=True)
    print("mobile overflow:", pg.evaluate("document.documentElement.scrollWidth - innerWidth"))
    # form states
    pg = page(1440, 900)
    pg.click("button[type=submit]"); pg.wait_for_timeout(300)
    pg.locator(".form-card").screenshot(path="screenshots/form-error.png")
    if "--submit" in sys.argv:
        pg.fill("#name", "Browser Test"); pg.fill("#email", "browser.test@example.com"); pg.fill("#country", "Ghana")
        pg.select_option("#careerPath", "Design and Creative Services")
        pg.click("button[type=submit]"); pg.wait_for_selector(".form-success")
        pg.locator(".form-card").screenshot(path="screenshots/form-success.png")
    b.close()
