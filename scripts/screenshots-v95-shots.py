"""v9.5 screenshots: entry point (desktop), a question (mobile), a result (desktop + mobile)."""
from playwright.sync_api import sync_playwright
URL = "http://localhost:3210/?path=va"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1.25, reduced_motion="reduce")
    pg = ctx.new_page(); pg.goto(URL, wait_until="networkidle")
    pg.evaluate("document.querySelector('[data-level-check]').scrollIntoView({block:'center'})"); pg.wait_for_timeout(600)
    pg.screenshot(path="screenshots/v95-levels-entry-1440.png")
    pg.locator("#levels [data-level-check] button").click(); pg.wait_for_timeout(500)
    pg.screenshot(path="screenshots/v95-quiz-q1-desktop.png")
    for i in range(5):
        pg.locator("[data-level-quiz] [role=radiogroup] label").nth(1).click()
        pg.get_by_role("button", name="See my level" if i == 4 else "Next").click(); pg.wait_for_timeout(250)
    pg.screenshot(path="screenshots/v95-quiz-result-desktop.png")
    ctx.close()
    ctx = b.new_context(viewport={"width": 390, "height": 780}, device_scale_factor=2, is_mobile=True, has_touch=True, reduced_motion="reduce")
    pg = ctx.new_page(); pg.goto(URL, wait_until="networkidle")
    pg.locator("#levels [data-level-check] button").click(); pg.wait_for_timeout(500)
    for i in range(5):
        pg.locator("[data-level-quiz] [role=radiogroup] label").nth(2 if i != 3 else 1).click(); pg.wait_for_timeout(100)
        if i == 3: pg.screenshot(path="screenshots/v95-quiz-q4-mobile.png")
        pg.get_by_role("button", name="See my level" if i == 4 else "Next").click(); pg.wait_for_timeout(250)
    pg.screenshot(path="screenshots/v95-quiz-result-mobile.png")
    pg.get_by_role("button", name="Choose this level").click(); pg.wait_for_timeout(1500)
    pg.screenshot(path="screenshots/v95-after-choose-mobile.png")
    print(pg.evaluate("[localStorage.getItem('veerly.level'), localStorage.getItem('veerly.levelSource'), location.search]"))
    ctx.close()
