"""v6.3 cohort coach screenshots at 700px (Notion embed width)."""
import json, datetime as dt
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3210/coach"
OUT = "screenshots"
WAT = dt.timezone(dt.timedelta(hours=1))
def ms(y, m, d, h=9): return int(dt.datetime(y, m, d, h, tzinfo=WAT).timestamp() * 1000)
KEY = "veerly.coach.cohort-1"

def page(b, now, saved=None):
    ctx = b.new_context(viewport={"width": 700, "height": 900}, device_scale_factor=2,
                        reduced_motion="reduce", timezone_id="Africa/Lagos")
    if saved is not None:
        ctx.add_init_script(f"localStorage.setItem({json.dumps(KEY)}, {json.dumps(json.dumps(saved))})")
    pg = ctx.new_page()
    pg.clock.install(time=now / 1000)
    pg.goto(BASE, wait_until="networkidle")
    pg.wait_for_timeout(600)
    return ctx, pg

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    ctx, pg = page(b, ms(2027, 1, 20))
    pg.wait_for_selector("[data-coach=intro]")
    pg.screenshot(path=f"{OUT}/v6.3-coach-intro.png", full_page=True)
    pg.click("[data-coach-start]")
    pg.wait_for_selector("[data-coach-confirm]")
    pg.wait_for_timeout(400)
    pg.screenshot(path=f"{OUT}/v6.3-coach-confirm.png")
    pg.click("text=Yes, start my cohort")
    pg.wait_for_selector("[data-coach=before]")
    print("before-ok", pg.evaluate(f"localStorage.getItem('{KEY}')"))
    ctx.close()

    done = ["jh-setup", "jh-15-roles", "jh-companies", "pb-case-1", "ip-intro", "rh-live"]
    ctx, pg = page(b, ms(2027, 2, 10, 14), {"startedAt": ms(2027, 1, 28), "done": done})
    pg.wait_for_selector("[data-coach=active]")
    pg.screenshot(path=f"{OUT}/v6.3-coach-active.png", full_page=True)
    # free-form toggle + persistence
    pg.click("label[for=x-ip-10-questions]")
    print("after-toggle", pg.evaluate(f"localStorage.getItem('{KEY}')"))
    pg.reload(wait_until="networkidle"); pg.wait_for_timeout(400)
    print("resume", pg.locator("[role=progressbar]").get_attribute("aria-valuenow"))
    ctx.close()

    ctx, pg = page(b, ms(2027, 3, 5), {"startedAt": ms(2027, 1, 28), "done": done + ["pb-case-2", "ip-10-questions"]})
    pg.wait_for_selector("[data-coach=closed]")
    pg.screenshot(path=f"{OUT}/v6.3-coach-closed.png", full_page=True)
    pg.click("[data-coach-restart]"); pg.wait_for_timeout(300)
    pg.click("text=Yes, restart"); pg.wait_for_selector("[data-coach=intro]")
    print("restart-ok", pg.evaluate(f"localStorage.getItem('{KEY}')"))
    ctx.close()
    b.close()
