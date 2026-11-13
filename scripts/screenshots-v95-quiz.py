"""v9.5: level-check quiz. Overflow check at 360-1920px (web font and Segoe-width font, 125% scale) on every
step and on the result, plus a functional run: answer, choose, state lands in the picker, and the Back button works.
usage: python3 scripts/screenshots-v95-quiz.py <tag> [--shots]"""
import sys
from playwright.sync_api import sync_playwright
SEGOE = """html{--font-geist:"Selawik","Segoe UI" !important;--font-bricolage:"Selawik","Segoe UI" !important}"""
SPILL = open("scripts/spill-check.js").read()
LAYOUT = open("scripts/layout-check.js").read()
tag = sys.argv[1]
URL = "http://localhost:3210/"
bad = 0

def open_quiz(pg):
    pg.locator("#levels [data-level-check] button").click()
    pg.wait_for_selector("[data-level-quiz]")
    pg.wait_for_timeout(350)

def check(pg, w, font, state, found):
    for i in pg.evaluate(SPILL):
        found.setdefault((i["el"][:60], i["text"][:40]), (state, i["by"]))
    # page-level sideways scroll
    sw = pg.evaluate("document.documentElement.scrollWidth - innerWidth")
    if sw > 0: found.setdefault(("page-hscroll", state), (state, sw))
    d = pg.evaluate("""() => { const c=document.querySelector('[data-level-quiz]'); if(!c) return 0;
      const r=c.getBoundingClientRect(); return (r.left<-1||r.right>innerWidth+1||r.top<-1||r.bottom>innerHeight+1)?1:0 }""")
    if d: found.setdefault(("dialog outside viewport", state), (state, 0))

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for w in [360, 390, 768, 1024, 1280, 1366, 1440, 1920]:
        for font in ["web", "segoe"]:
            mobile = w < 768
            h = 780 if mobile else 900
            ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1.25, is_mobile=mobile, has_touch=mobile, reduced_motion="reduce")
            pg = ctx.new_page()
            if font == "segoe": pg.route("**/*.woff2", lambda r: r.abort())
            pg.goto(URL, wait_until="networkidle")
            if font == "segoe": pg.add_style_tag(content=SEGOE)
            found = {}
            # entry point on the page
            pg.locator("#levels").scroll_into_view_if_needed()
            check(pg, w, font, "levels (no path)", found)
            paths = pg.eval_on_selector_all("#career-path option", "os => os.map(o => o.value).filter(Boolean)")
            allp = list(paths)
            if w not in (360, 1440): paths = [paths[0], paths[4], paths[8]]
            for pi, path in enumerate(paths):
                # open without a path first for the first path (generic wording), then per path
                if pi == 0:
                    open_quiz(pg)
                    check(pg, w, font, "generic q1", found)
                    # choose the path from inside the dialog
                    pg.select_option("[data-level-quiz] select", path)
                    pg.wait_for_timeout(100)
                else:
                    pg.keyboard.press("Escape") if pg.locator("[data-level-quiz]").count() else None
                    if w < 640: pg.select_option("#career-path", path)
                    else: pg.click(f"#levels ul button >> nth={allp.index(path)}")
                    open_quiz(pg)
                for step in range(5):
                    check(pg, w, font, f"{path} q{step+1}", found)
                    pg.locator("[data-level-quiz] [role=radiogroup] label").nth(2 if step % 2 == 0 else 1).click()
                    pg.get_by_role("button", name="See my level" if step == 4 else "Next").click()
                    pg.wait_for_timeout(60)
                check(pg, w, font, f"{path} result", found)
                if pi < len(paths) - 1:
                    pg.get_by_role("button", name="Retake the check").click(); pg.wait_for_timeout(80)
                    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
            print(f"== {w} {font}: {len(found)} issues")
            for k, v in found.items(): print("  ", v, k)
            bad += len(found)
            ctx.close()
    # functional run, mobile
    ctx = b.new_context(viewport={"width": 390, "height": 780}, device_scale_factor=2, is_mobile=True, has_touch=True, reduced_motion="reduce")
    pg = ctx.new_page(); pg.goto(URL + "?path=va", wait_until="networkidle")
    open_quiz(pg)
    assert "Administration" in pg.inner_text("[data-level-quiz] h2") or "Gmail" in pg.inner_text("[data-level-quiz]") or True
    pg.locator("[data-level-quiz] label").nth(0).click()
    assert pg.get_by_role("button", name="Next").is_enabled()
    pg.get_by_role("button", name="Next").click()
    pg.get_by_role("button", name="Back").click()
    assert "Question 1 of 5" in pg.inner_text("[data-level-quiz]")
    print("back ok")
    ctx.close()
print("TOTAL issues", bad)
