"""Currency screenshots. Usage: python3 scripts/screenshots-pricing.py [base_url] [--prefix v6]
Captures the hero and the pricing band with the auto-detected currency (timezone Africa/Lagos → NGN)
and with GBP chosen in the selector (persisted in localStorage), and checks that the choice survives a reload."""
import sys
from playwright.sync_api import sync_playwright

base = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:3210")
prefix = sys.argv[sys.argv.index("--prefix") + 1] if "--prefix" in sys.argv else "v6"
out = lambda name: f"screenshots/{prefix}-{name}.png"

def page(b, tz="Africa/Lagos", locale="en-NG", path="/", w=1440, h=900):
    ctx = b.new_context(viewport={"width": w, "height": h}, timezone_id=tz, locale=locale, reduced_motion="reduce")
    pg = ctx.new_page()
    pg.goto(base + path, wait_until="networkidle")
    pg.evaluate("document.fonts.ready")
    pg.wait_for_timeout(800)
    return ctx, pg

def hero_price(pg):
    return pg.locator("[data-currency-select]").first.inner_text().strip()

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")

    ctx, pg = page(b)
    print("Lagos default:", hero_price(pg))
    pg.screenshot(path=out("hero"))
    pg.locator("#pricing").screenshot(path=out("pricing-ngn"))

    # choose GBP in the pricing-band selector
    pg.locator("#pricing [data-currency-select]").click()
    pg.get_by_role("option", name="GBP").click()
    pg.wait_for_timeout(300)
    pg.mouse.move(0, 0)
    pg.locator("#pricing").screenshot(path=out("pricing-gbp"))
    print("stored:", pg.evaluate("localStorage.getItem('veerly.currency')"))
    pg.reload(wait_until="networkidle"); pg.wait_for_timeout(600)
    print("after reload hero:", hero_price(pg), "| note:", pg.locator("[data-currency-note]").first.inner_text())
    pg.screenshot(path=out("hero-gbp"))
    # open selector for a shot of the menu
    pg.locator("[data-currency-select]").first.click(); pg.wait_for_timeout(300)
    pg.screenshot(path=out("selector-open"))
    ctx.close()

    for tz, loc in [("America/New_York", "en-US"), ("Europe/London", "en-GB"), ("Asia/Tokyo", "ja-JP"), ("Africa/Nairobi", "en-KE")]:
        ctx, pg = page(b, tz, loc)
        print(f"{tz} {loc}:", hero_price(pg))
        ctx.close()

    ctx, pg = page(b, path="/?preview=launched")
    pg.screenshot(path=out("launched-hero"))
    pg.locator("#join-card").scroll_into_view_if_needed()
    pg.locator("#join-card").screenshot(path=out("checkout-card"))
    ctx.close()

    ctx, pg = page(b, w=390, h=844)
    pg.screenshot(path=out("mobile-hero"))
    ctx.close()
    b.close()
