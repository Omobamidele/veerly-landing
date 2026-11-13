"""v9.6: level-check result for a student who already paid for Beginner (remembered in this browser) and gets an
Advanced suggestion: the result offers the add-on link. Needs the site on 3210."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for dev, vp, mob in [("desktop", {"width": 1440, "height": 900}, False), ("mobile", {"width": 390, "height": 780}, True)]:
        ctx = b.new_context(viewport=vp, device_scale_factor=1.5, is_mobile=mob, has_touch=mob, reduced_motion="reduce", locale="en-GB", timezone_id="Europe/London")
        ctx.add_init_script("localStorage.setItem('veerly.owned', JSON.stringify([{path:'va',level:'beginner'}]))")
        pg = ctx.new_page(); pg.goto("http://localhost:3210/?path=va&preview=promo", wait_until="networkidle")
        pg.locator("#levels [data-level-check] button").click(); pg.wait_for_selector("[data-level-quiz]"); pg.wait_for_timeout(350)
        for i in range(5):
            pg.locator("[data-level-quiz] [role=radiogroup] label").nth(2).click()
            pg.get_by_role("button", name="See my level" if i == 4 else "Next").click(); pg.wait_for_timeout(200)
        pg.wait_for_selector("[data-quiz-addon]")
        href = pg.locator("[data-quiz-addon] a").get_attribute("href")
        print(dev, "|", pg.inner_text("[data-quiz-addon]").replace("\n", " "), "|", href)
        pg.screenshot(path=f"screenshots/v96/quiz-result-addon-{dev}.png")
        pg.locator("[data-quiz-addon] a").click(); pg.wait_for_url("**/add-level?path=va&level=advanced"); pg.wait_for_timeout(500)
        print(dev, "landed:", pg.url, "| selected:", pg.locator("input[name=addon-level]:checked").get_attribute("value"))
        ctx.close()
    b.close()
