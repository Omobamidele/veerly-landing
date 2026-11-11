"""v9 screenshots: full page, hero, path/level picker, currency picker.
Usage: python3 scripts/screenshots-v9.py [base_url]
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

base = "http://localhost:3210"
CHROME = "/usr/bin/google-chrome"
out_dir = Path("/workspace/veerly-landing/screenshots")
out_dir.mkdir(exist_ok=True)


def shot(name):
    return str(out_dir / f"v9-{name}.png")


def open_page(browser, w=1440, h=900, mobile=False):
    ctx = browser.new_context(
        viewport={"width": w, "height": h},
        device_scale_factor=2 if mobile else 1,
        is_mobile=mobile,
        has_touch=mobile,
        reduced_motion="reduce",
        timezone_id="Africa/Lagos",
        locale="en-NG",
    )
    pg = ctx.new_page()
    pg.goto(base + "/", wait_until="networkidle")
    pg.evaluate("document.fonts.ready")
    # Let images and tiles settle; scroll to trigger lazy bits, then return to top.
    pg.evaluate(
        """async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 700) {
            scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
          scrollTo(0, 0);
        }"""
    )
    pg.wait_for_timeout(800)
    return ctx, pg


def hide_sticky_nav(pg):
    pg.evaluate(
        """() => {
          const h = document.querySelector('header');
          if (h) h.style.setProperty('display', 'none', 'important');
        }"""
    )


def crop(pg, locator, path, pad=24):
    box = locator.bounding_box()
    if not box:
        raise RuntimeError(f"no box for {path}")
    vp = pg.viewport_size
    clip = {
        "x": max(0, box["x"] - pad),
        "y": max(0, box["y"] - pad),
        "width": min(vp["width"] - max(0, box["x"] - pad), box["width"] + pad * 2),
        "height": min(vp["height"] - max(0, box["y"] - pad), box["height"] + pad * 2),
    }
    pg.screenshot(path=path, clip=clip)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME)

    # --- Desktop hero (nav + yellow bar + countdown, Mo's v8.1 wording) ---
    ctx, pg = open_page(browser, w=1440, h=1200)
    pg.screenshot(path=shot("hero-desktop"))
    print("hero-desktop ok", pg.locator("[data-tile]").count())

    # --- Desktop full page (sticky nav hidden so it doesn't stamp mid-page) ---
    hide_sticky_nav(pg)
    pg.screenshot(path=shot("full-desktop"), full_page=True)
    print("full-desktop overflow:", pg.evaluate("document.documentElement.scrollWidth - innerWidth"))
    ctx.close()

    # --- Desktop path/level picker: select a path + a level ---
    ctx, pg = open_page(browser, w=1440, h=1400)
    hide_sticky_nav(pg)
    pg.locator("#levels").scroll_into_view_if_needed()
    pg.wait_for_timeout(300)
    pg.get_by_role("button", name="Virtual Assistant", exact=True).click()
    pg.wait_for_timeout(200)
    pg.get_by_role("button", name="Choose Intermediate").click()
    pg.wait_for_timeout(300)
    pg.locator("#levels").screenshot(path=shot("path-level-desktop"))
    print("path-level-desktop ok")
    ctx.close()

    # --- Desktop currency picker, open, on the hero yellow chip ---
    ctx, pg = open_page(browser, w=1440, h=1200)
    trigger = pg.locator("[data-currency-select]").first
    trigger.scroll_into_view_if_needed()
    pg.wait_for_timeout(200)
    shown = trigger.inner_text()
    print("currency trigger text:", shown)
    trigger.click()
    pg.wait_for_timeout(350)
    content = pg.locator("[data-slot=select-content], [role=listbox]").first
    content.wait_for(state="visible")
    # Crop a generous area around the trigger + open menu.
    tbox = trigger.bounding_box()
    cbox = content.bounding_box()
    vp = pg.viewport_size
    x = max(0, min(tbox["x"], cbox["x"]) - 56)
    y = max(0, min(tbox["y"], cbox["y"]) - 64)
    r = max(tbox["x"] + tbox["width"], cbox["x"] + cbox["width"]) + 56
    b = max(tbox["y"] + tbox["height"], cbox["y"] + cbox["height"]) + 56
    clip = {
        "x": x,
        "y": y,
        "width": min(vp["width"] - x, r - x),
        "height": min(vp["height"] - y, b - y),
    }
    pg.screenshot(path=shot("currency-desktop"), clip=clip)
    print("currency-desktop ok", clip)
    ctx.close()

    # --- Mobile hero: tall viewport so tiles aren't clipped ---
    ctx, pg = open_page(browser, w=390, h=1400, mobile=True)
    pg.screenshot(path=shot("hero-mobile"))
    print("hero-mobile ok")

    # --- Mobile full page ---
    hide_sticky_nav(pg)
    pg.screenshot(path=shot("full-mobile"), full_page=True)
    print("full-mobile overflow:", pg.evaluate("document.documentElement.scrollWidth - innerWidth"))
    ctx.close()

    # --- Mobile path/level: native select + cards ---
    ctx, pg = open_page(browser, w=390, h=1400, mobile=True)
    hide_sticky_nav(pg)
    pg.locator("#levels").scroll_into_view_if_needed()
    pg.wait_for_timeout(300)
    # The native select is sm:hidden; pick VA then a level.
    sel = pg.locator("#levels select, #levels [data-slot=native-select]")
    if sel.count():
        sel.first.select_option(label="Virtual Assistant")
    else:
        pg.get_by_role("button", name="Virtual Assistant", exact=True).click()
    pg.wait_for_timeout(200)
    pg.get_by_role("button", name="Choose Intermediate").click()
    pg.wait_for_timeout(300)
    pg.locator("#levels").screenshot(path=shot("path-level-mobile"))
    print("path-level-mobile ok")
    ctx.close()

    # --- Mobile currency picker open ---
    ctx, pg = open_page(browser, w=390, h=1400, mobile=True)
    trigger = pg.locator("[data-currency-select]").first
    trigger.scroll_into_view_if_needed()
    pg.wait_for_timeout(200)
    trigger.click()
    pg.wait_for_timeout(400)
    content = pg.locator("[data-slot=select-content], [role=listbox]").first
    content.wait_for(state="visible")
    tbox = trigger.bounding_box()
    cbox = content.bounding_box()
    vp = pg.viewport_size
    x = max(0, min(tbox["x"], cbox["x"]) - 16)
    y = max(0, min(tbox["y"], cbox["y"]) - 16)
    r = max(tbox["x"] + tbox["width"], cbox["x"] + cbox["width"]) + 16
    b = max(tbox["y"] + tbox["height"], cbox["y"] + cbox["height"]) + 16
    clip = {
        "x": x,
        "y": y,
        "width": min(vp["width"] - x, r - x),
        "height": min(vp["height"] - y, b - y),
    }
    pg.screenshot(path=shot("currency-mobile"), clip=clip)
    print("currency-mobile ok", clip)
    ctx.close()

    browser.close()
    print("all v9 screenshots written")
