"""v9.6: /add-level screenshots + overflow checks. Needs `npm run start` on 3210 with a seeded WAITLIST_FILE
(paid student ada@example.com, VA Beginner), PAYSTACK_SECRET_KEY set to any fake value and NEXT_PUBLIC_LAUNCH_STATE=enrol.
usage: python3 scripts/screenshots-v96.py [--shots] [--checks]"""
import sys
from playwright.sync_api import sync_playwright
B = "http://localhost:3210"
SPILL = open("scripts/spill-check.js").read()
LAYOUT = open("scripts/layout-check.js").read()
SEGOE = """html{--font-geist:"Selawik","Segoe UI" !important;--font-bricolage:"Selawik","Segoe UI" !important}"""
SHOTS = "--shots" in sys.argv or "--checks" not in sys.argv
CHECKS = "--checks" in sys.argv or "--shots" not in sys.argv
bad = 0

_n = [0]
def ctx_for(b, w, h, mobile, locale="en-NG", tz="Africa/Lagos", dsf=1.5):
    _n[0] += 1  # each context gets its own client IP so the lookup rate limit doesn't trip the run
    return b.new_context(extra_http_headers={"x-forwarded-for": f"10.9.{_n[0] // 250}.{_n[0] % 250}"}, viewport={"width": w, "height": h}, device_scale_factor=dsf, is_mobile=mobile, has_touch=mobile,
                         reduced_motion="reduce", locale=locale, timezone_id=tz)

def run_state(pg, name):
    if name == "empty":
        pg.goto(f"{B}/add-level", wait_until="networkidle")
    elif name == "deeplink":
        pg.goto(f"{B}/add-level?path=va&level=intermediate", wait_until="networkidle")
        pg.fill("input[autocomplete=email]", "ada@example.com")
        pg.get_by_role("button", name="Find my payment").click()
        pg.wait_for_selector("[data-lookup=found]")
    elif name == "owned-link":
        pg.goto(f"{B}/add-level?path=va&level=beginner", wait_until="networkidle")
        pg.fill("input[autocomplete=email]", "ada@example.com")
        pg.get_by_role("button", name="Find my payment").click()
        pg.wait_for_selector("[data-blocked]")
    elif name == "not-found":
        pg.goto(f"{B}/add-level?path=va&level=advanced", wait_until="networkidle")
        pg.fill("input[autocomplete=email]", "nobody@example.com")
        pg.get_by_role("button", name="Find my payment").click()
        pg.wait_for_selector("[data-stated-owned]")
    elif name == "confirm":
        run_state(pg, "deeplink")
        pg.get_by_role("button", name="Continue").click()
        pg.wait_for_selector("[data-addon-confirm]")
    elif name == "success":
        pg.goto(f"{B}/add-level/success?preview=paid&path=va&level=intermediate", wait_until="networkidle")
    pg.wait_for_timeout(350)

NAMES = ["empty", "deeplink", "owned-link", "not-found", "confirm", "success"]

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    if SHOTS:
        for dev, w, h, mob in [("desktop", 1440, 900, False), ("mobile", 390, 780, True)]:
            for name in NAMES:
                ctx = ctx_for(b, w, h, mob); pg = ctx.new_page()
                run_state(pg, name)
                pg.screenshot(path=f"screenshots/v96/{name}-{dev}.png", full_page=(name != "confirm"))
                if name in ("deeplink", "confirm", "empty"):
                    print(dev, name, "|", " / ".join(pg.inner_text("[data-addon-confirm]" if name == "confirm" else "[data-addon-summary]").split("\n")[:8]))
                ctx.close()
        # The currency dropdown beside the price: open on the page, and open inside the confirm dialog
        for dev, w, h, mob in [("desktop", 1440, 900, False), ("mobile", 390, 780, True)]:
            ctx = ctx_for(b, w, h, mob); pg = ctx.new_page()
            run_state(pg, "deeplink")
            pg.locator("[data-addon-price-row] [data-currency-select]").click(); pg.wait_for_timeout(300)
            pg.screenshot(path=f"screenshots/v96/currency-dropdown-{dev}.png")
            pg.get_by_role("option", name="GBP").click(); pg.wait_for_timeout(250)
            print(dev, "after choosing GBP:", pg.inner_text("[data-addon-price-row]").replace("\n", " | "))
            pg.get_by_role("button", name="Continue").click(); pg.wait_for_selector("[data-addon-confirm]"); pg.wait_for_timeout(300)
            pg.locator("[data-addon-confirm-currency] [data-currency-select]").click(); pg.wait_for_timeout(300)
            pg.screenshot(path=f"screenshots/v96/confirm-dropdown-{dev}.png")
            pg.get_by_role("option", name="NGN").click(); pg.wait_for_timeout(250)
            print(dev, "dialog after choosing NGN:", pg.inner_text("[data-addon-confirm]").replace("\n", " | "))
            ctx.close()
        # Outside Nigeria: dollars first, approximate local amount beside it
        for dev, w, h, mob in [("desktop", 1440, 900, False), ("mobile", 390, 780, True)]:
            ctx = ctx_for(b, w, h, mob, locale="en-GB", tz="Europe/London"); pg = ctx.new_page()
            run_state(pg, "confirm")
            pg.screenshot(path=f"screenshots/v96/confirm-gbp-{dev}.png")
            print(dev, "gbp confirm |", pg.inner_text("[data-addon-confirm]").replace("\n", " | "))
            pg.keyboard.press("Escape"); pg.wait_for_timeout(250)
            pg.screenshot(path=f"screenshots/v96/deeplink-gbp-{dev}.png", full_page=True)
            print(dev, "gbp summary |", pg.inner_text("[data-addon-summary]").replace("\n", " | "))
            ctx.close()
    if CHECKS:
        for w in [360, 390, 768, 1024, 1280, 1366, 1440, 1920]:
            for font in ["web", "segoe"]:
                for name in NAMES:
                    mobile = w < 768
                    ctx = ctx_for(b, w, 780 if mobile else 900, mobile, dsf=1.25); pg = ctx.new_page()
                    if font == "segoe": pg.route("**/*.woff2", lambda r: r.abort())
                    pg.goto(f"{B}/add-level", wait_until="networkidle")
                    if font == "segoe": pg.add_style_tag(content=SEGOE)
                    run_state(pg, name)
                    if font == "segoe": pg.add_style_tag(content=SEGOE)
                    found = []
                    for i in pg.evaluate(SPILL): found.append(("spill", i["el"][:60], i["text"][:40], i["by"]))
                    # icon-shrunk is ignored: icons are sized by class (size-4), not by the width attribute
                    for i in pg.evaluate(LAYOUT):
                        if i["kind"] != "icon-shrunk": found.append(("layout", i))
                    for f in found:
                        bad += 1; print("ISSUE", w, font, name, f)
                    ctx.close()
        print("overflow issues:", bad)
    b.close()
sys.exit(1 if bad else 0)
