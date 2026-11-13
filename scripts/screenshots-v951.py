"""v9.5.1: checkout confirm step (needs a server with PAYSTACK_SECRET_KEY set, on port 3212), quiz result note, FAQ, line under levels."""
from playwright.sync_api import sync_playwright
BASE = "http://localhost:3212/?path=va&level=beginner&preview=enrol"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for name, vp, mob, dsf in [("desktop", {"width": 1440, "height": 900}, False, 1.5), ("mobile", {"width": 390, "height": 780}, True, 2)]:
        ctx = b.new_context(viewport=vp, device_scale_factor=dsf, is_mobile=mob, has_touch=mob, reduced_motion="reduce", locale="en-NG", timezone_id="Africa/Lagos")
        pg = ctx.new_page(); pg.goto(BASE, wait_until="networkidle")
        pg.locator("#co-email").scroll_into_view_if_needed()
        pg.fill("#co-email", "ada@example.com")
        pg.get_by_role("button", name="securely").click(); pg.wait_for_timeout(500)
        pg.screenshot(path=f"screenshots/v951/checkout-confirm-{name}.png")
        print(name, pg.inner_text("[data-level-confirm]").replace("\n", " | "))
        pg.keyboard.press("Escape")
        ctx.close()
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1.5, reduced_motion="reduce", locale="en-NG", timezone_id="Africa/Lagos")
    pg = ctx.new_page(); pg.goto("http://localhost:3210/?path=va", wait_until="networkidle")
    pg.locator("#levels [data-level-check] button").click(); pg.wait_for_timeout(400)
    for i in range(5):
        pg.locator("[data-level-quiz] [role=radiogroup] label").nth(1).click()
        pg.get_by_role("button", name="See my level" if i == 4 else "Next").click(); pg.wait_for_timeout(200)
    pg.screenshot(path="screenshots/v951/quiz-result-note-desktop.png")
    print("quiz:", pg.inner_text("[data-level-change-note]"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    print("line:", pg.inner_text("[data-level-switch]"))
    pg.evaluate("document.querySelector('[data-level-check]').scrollIntoView({block:'start'})")
    pg.evaluate("window.scrollBy(0,-120)"); pg.wait_for_timeout(400)
    # open FAQ entries
    pg.locator("#faq").scroll_into_view_if_needed()
    for q in ["How do I know which level to choose?", "Can I change my level later?"]:
        pg.get_by_role("button", name=q).click(); pg.wait_for_timeout(300)
        print("faq:", q, "->", pg.locator("#faq [data-state=open][role=region]").last.inner_text())
    pg.screenshot(path="screenshots/v951/faq-desktop.png")
    ctx.close()
