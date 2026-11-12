import sys, json
from playwright.sync_api import sync_playwright
tag = sys.argv[1]
base = "http://localhost:3210"
CHROME = "/usr/bin/google-chrome"
SEGOE = """html{--font-geist:"Selawik","Segoe UI" !important;--font-bricolage:"Selawik","Segoe UI" !important}"""
CHECK = open("scripts/layout-check.js").read()
configs = []
for w in [360,390,768,1024,1280,1366,1440,1920]:
    for dsf in [1,1.25]:
        for font in ["web","segoe"]:
            configs.append((w,dsf,font))
only = sys.argv[2] if len(sys.argv)>2 else None
res = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    for w,dsf,font in configs:
        mobile = w < 768
        ctx = b.new_context(viewport={"width": w, "height": 900 if w>=768 else 800}, device_scale_factor=dsf, is_mobile=mobile, has_touch=mobile, reduced_motion="reduce")
        pg = ctx.new_page()
        if font == "segoe":
            pg.route("**/*.woff2", lambda r: r.abort())
        pg.goto(base + "/", wait_until="networkidle")
        if font == "segoe":
            pg.add_style_tag(content=SEGOE)
        pg.evaluate("document.fonts.ready")
        pg.evaluate("""async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); }""")
        pg.wait_for_timeout(600)
        name = f"{tag}-{w}-{dsf}-{font}"
        issues = pg.evaluate(CHECK)
        res[name] = issues
        if dsf == 1.25 or w in (390,1440):
            pg.screenshot(path=f"screenshots/v94-{name}-top.png")
        if (w in (390,1366) and dsf==1.25) or only:
            pg.screenshot(path=f"screenshots/v94-{name}-full.png", full_page=True)
        ctx.close()
json.dump(res, open(f"screenshots/v94-{tag}-issues.json","w"), indent=1)
for k,v in res.items():
    print(k, len(v))
