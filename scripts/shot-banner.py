import sys
from playwright.sync_api import sync_playwright
port, out, mode = sys.argv[1], sys.argv[2], sys.argv[3]  # mode: desktop|mobile
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    if mode == "desktop":
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2, reduced_motion="reduce")
    else:
        ctx = b.new_context(viewport={"width": 390, "height": 780}, device_scale_factor=2, is_mobile=True, has_touch=True, reduced_motion="reduce")
    pg = ctx.new_page(); pg.goto(f"http://localhost:{port}/?path=va", wait_until="networkidle")
    el = pg.locator("[data-level-check]")
    el.scroll_into_view_if_needed(); pg.evaluate("window.scrollBy(0,-120)"); pg.wait_for_timeout(700)
    bb = el.bounding_box()
    pad = 24
    pg.screenshot(path=out, clip={"x": max(0,bb["x"]-pad), "y": max(0,bb["y"]-pad), "width": min(bb["width"]+2*pad, pg.viewport_size["width"]), "height": bb["height"]+2*pad})
