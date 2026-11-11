import asyncio,os
from icons import ICONS
from build import tile,TILES
from playwright.async_api import async_playwright
OUT='/workspace/veerly-coach/public/icons/v2'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg=await b.new_page(viewport={'width':280,'height':280})
        n=0
        for st in TILES:
            os.makedirs(f'{OUT}/{st}',exist_ok=True)
            for name,d in ICONS.items():
                if d['ui']: continue
                await pg.set_content('<html><body style="margin:0;background:transparent">'+tile(name,st)+'</body></html>')
                await pg.screenshot(path=f'{OUT}/{st}/{name}.png',omit_background=True); n+=1
        await b.close(); print(n)
asyncio.run(main())
