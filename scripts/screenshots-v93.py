"""v9.3 screenshots of the "See inside your workspace" section.
Usage: python3 scripts/screenshots-v93.py [base_url]
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3210"
out = Path(__file__).resolve().parent.parent / "screenshots"
out.mkdir(exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for name, w, h, mobile in [("desktop", 1440, 900, False), ("mobile", 390, 844, True)]:
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2,
                            is_mobile=mobile, has_touch=mobile, reduced_motion="reduce",
                            timezone_id="Africa/Lagos", locale="en-NG")
        pg = ctx.new_page()
        pg.goto(base + "/", wait_until="networkidle")
        pg.evaluate("document.fonts.ready")
        pg.evaluate("() => { const h = document.querySelector('header'); if (h) h.style.setProperty('display','none','important'); }")
        sec = pg.locator("#workspace")
        sec.scroll_into_view_if_needed()
        pg.wait_for_timeout(600)
        pg.wait_for_function("() => [...document.querySelectorAll('#workspace img')].filter(i => i.offsetParent).every(i => i.complete && i.naturalWidth > 0)")
        sec.screenshot(path=str(out / f"v9.3-workspace-{name}.png"))
        # Second tab too, to check switching works.
        pg.get_by_role("tab", name="Four-week plan").click()
        pg.wait_for_timeout(400)
        pg.wait_for_function("() => [...document.querySelectorAll('#workspace img')].filter(i => i.offsetParent).every(i => i.complete && i.naturalWidth > 0)")
        sec.screenshot(path=str(f"/tmp/v93-{name}-weeks.png"))
        ctx.close()
    b.close()
print("ok")
