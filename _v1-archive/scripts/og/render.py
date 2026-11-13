import sys, pathlib
from playwright.sync_api import sync_playwright
here = pathlib.Path(__file__).parent
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg = b.new_page(viewport={"width":1200,"height":630})
    pg.goto((here/"og.html").as_uri()); pg.wait_for_timeout(1500)
    pg.evaluate("document.fonts.ready")
    for out in sys.argv[1:]: pg.screenshot(path=out)
    b.close()
