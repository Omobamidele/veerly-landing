"""v9.1 screenshots of every section where Veerly icons show. Usage: python3 scripts/screenshots-icons.py [base]"""
import sys
from playwright.sync_api import sync_playwright
base = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:3210")
out = lambda n: f"screenshots/v9.1-{n}.png"
def open_page(b, path="/", w=1440, h=900):
    ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2, reduced_motion="reduce")
    pg = ctx.new_page(); pg.goto(base + path, wait_until="networkidle"); pg.evaluate("document.fonts.ready")
    pg.evaluate("""async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } scrollTo(0, 0); }""")
    pg.wait_for_timeout(1000); return pg
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg = open_page(b)
    pg.screenshot(path=out("hero"))
    for sec in ["systems", "paths", "pricing", "faq"]:
        el = pg.locator(f"#{sec}"); el.scroll_into_view_if_needed(); pg.wait_for_timeout(300); el.screenshot(path=out(sec))
    # FAQ with one item open (chevron state)
    t = pg.locator("#faq button[aria-expanded]").first
    if t.count(): t.click(); pg.wait_for_timeout(400); pg.locator("#faq").screenshot(path=out("faq-open"))
    pg = open_page(b, "/?preview=launched"); el = pg.locator("#join-card")
    if el.count(): el.scroll_into_view_if_needed(); el.screenshot(path=out("checkout-card"))
    pg = open_page(b, "/welcome?preview=paid"); pg.screenshot(path=out("welcome"), full_page=True)
    pg = open_page(b, "/coach"); pg.screenshot(path=out("coach"), full_page=True)
    pg = open_page(b, w=390, h=844); pg.screenshot(path=out("mobile-hero"))
    b.close()
print("ok")
