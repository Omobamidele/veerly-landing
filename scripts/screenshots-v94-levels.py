import sys, json
from playwright.sync_api import sync_playwright
SEGOE = """html{--font-geist:"Selawik","Segoe UI" !important;--font-bricolage:"Selawik","Segoe UI" !important}"""
SPILL = open("scripts/spill-check.js").read()
tag=sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for w in [360,390,768,1024,1280,1366,1440,1920]:
      for font in ["web","segoe"]:
        mobile = w < 768
        ctx = b.new_context(viewport={"width": w, "height": 900}, device_scale_factor=1.25, is_mobile=mobile, has_touch=mobile, reduced_motion="reduce")
        pg = ctx.new_page()
        if font=="segoe": pg.route("**/*.woff2", lambda r: r.abort())
        pg.goto("http://localhost:3210/", wait_until="networkidle")
        if font=="segoe": pg.add_style_tag(content=SEGOE)
        found = {}
        def rec(state):
            for i in pg.evaluate(SPILL):
                k=(i['el'][:60], i['text'][:40])
                found.setdefault(k, (state, i['by']))
        rec("initial")
        opts = pg.eval_on_selector_all("#career-path option", "os => os.map(o => o.value).filter(Boolean)")
        for o in opts:
            if w < 640:
                pg.select_option("#career-path", o)
            else:
                pg.click(f"#levels ul button >> nth={opts.index(o)}")
            pg.wait_for_timeout(100)
            rec(f"path {o}")
            n = pg.locator("#levels li button[type=button]").count()
            for j in range(3):
                btns = pg.locator("#levels > div > ul.grid li button")
                btns.nth(j).click()
                pg.wait_for_timeout(150)
                rec(f"path {o} level {j}")
        print(f"== {w} {font}: {len(found)}")
        for k,v in found.items(): print("  ", v, k)
        if w in (390,1366) and font=="segoe":
            pg.locator("#levels").screenshot(path=f"screenshots/v94-{tag}-levels-{w}.png")
            pg.locator("#join-card").screenshot(path=f"screenshots/v94-{tag}-join-{w}.png")
        ctx.close()
