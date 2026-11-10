"""Preview screenshots + a real UI signup test.
Usage: python3 scripts/screenshots.py [base_url] [--submit] [--switch] [--prefix v4]
--submit fills the real form (Name, Email, WhatsApp +234, both consents), completes step 2 and captures the success state.
--switch fakes the clock to 3 s before enrolment opens (1 Jan 2027) and checks the page flips to "Get founding access".
"""
import sys
from playwright.sync_api import sync_playwright

base = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:3210")
prefix = sys.argv[sys.argv.index("--prefix") + 1] if "--prefix" in sys.argv else "v4"
CHROME = "/usr/bin/google-chrome"
out = lambda name: f"screenshots/{prefix}-{name}.png"

def open_page(b, path="/", w=1440, h=900, mobile=False):
    ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2 if mobile else 1,
                        is_mobile=mobile, has_touch=mobile, reduced_motion="reduce")
    pg = ctx.new_page()
    pg.goto(base + path, wait_until="networkidle")
    pg.evaluate("document.fonts.ready")
    pg.evaluate("""async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } scrollTo(0, 0); }""")
    pg.wait_for_timeout(1200)
    return pg

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    pg = open_page(b)
    pg.screenshot(path=out("hero"))
    pg.screenshot(path=out("desktop"), full_page=True)
    print("desktop overflow:", pg.evaluate("document.documentElement.scrollWidth - innerWidth"))
    pg = open_page(b, w=390, h=844, mobile=True)
    pg.screenshot(path=out("mobile"), full_page=True)
    print("mobile overflow:", pg.evaluate("document.documentElement.scrollWidth - innerWidth"))
    pg = open_page(b, "/?preview=launched")
    pg.screenshot(path=out("launched-hero"))
    pg = open_page(b, "/welcome?preview=paid")
    pg.screenshot(path=out("welcome"), full_page=True)

    pg = open_page(b)
    pg.locator("#join-card").scroll_into_view_if_needed()
    pg.locator("#join-card").screenshot(path=out("form"))
    pg.click("#join-card button[type=submit]")
    pg.wait_for_timeout(250)
    pg.locator("#join-card").screenshot(path=out("form-errors"))
    if "--submit" in sys.argv:
        pg.fill("#name", "UI Test Person")
        import time; pg.fill("#email", f"ui.test.{int(time.time())}@example.com")
        pg.select_option("#whatsappCountry", "NG")
        pg.fill("#whatsapp", "0803 123 4567")
        pg.click("#emailConsent")
        pg.click("#whatsappConsent")
        pg.click("#join-card button[type=submit]")
        pg.wait_for_selector("#join-card [data-step=profile]")
        pg.wait_for_timeout(300)
        pg.locator("#join-card").screenshot(path=out("form-step2"))
        pg.select_option("#country", "Nigeria")
        pg.click("#careerStage"); pg.get_by_role("option", name="Changing careers").click()
        pg.fill("#profession", "Customer support")
        pg.click("#careerPath"); pg.get_by_role("option", name="Customer Success and Support").click()
        pg.click("#join-card button[type=submit]")
        pg.wait_for_selector("#join-card [data-step=done]")
        pg.wait_for_timeout(300)
        pg.locator("#join-card").screenshot(path=out("form-success"))
        print("ui signup: ok")
    b.close()

if "--switch" in sys.argv:
    from datetime import datetime, timedelta, timezone
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROME)
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        pg = ctx.new_page()
        launch = datetime(2027, 1, 1, 8, 0, 0, tzinfo=timezone.utc)  # enrolment opens (lib/launch.ts)
        pg.clock.install(time=launch - timedelta(seconds=3))
        pg.goto(base, wait_until="networkidle")
        before = pg.locator("#join-card [data-card-title]").inner_text()
        pg.clock.run_for(5000)
        pg.wait_for_timeout(300)
        after = pg.locator("#join-card [data-card-title]").inner_text()
        cta = pg.locator("header [data-launch-cta]").first.inner_text()
        print(f"countdown switch: before='{before}' after='{after}' nav='{cta}'")
        b.close()
