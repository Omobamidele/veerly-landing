import asyncio,html,sys
from icons import ICONS
from build import svg,tile
from playwright.async_api import async_playwright
GROUPS=[('Course',['path','portfolio','job-ready','dashboard','target','week-review','mic','folder','library','checklist','chat-pair','dictionary']),
('Portfolio projects',['inbox','calendar-clock','handshake','plane','sheet','palette','board','bolt','workflow','gem','team']),
('Core skills',['mail','calendar-days','pen','spreadsheet','map','headset','board-square','steps','shield']),
('Tool guides',['mail-open','calendar','grad-cap','idea','at','monitor','calendar-plus','video','chat','grid','todo','notebook','brush','key','nib']),
('Certifications',['award','sparkle','medal','bot','wrench']),
('Interface',['arrow-right','arrow-down','check','chevron-down','chevron-up','clock','lock','restart','spinner'])]
assert sum(len(g) for _,g in GROUPS)==len(ICONS), (sum(len(g) for _,g in GROUPS),len(ICONS))
def cell(n): return f'<div class="c"><div class="i">{svg(n,size=48)}</div><div class="n">{n}</div></div>'
rows=''.join(f'<h2>{t}</h2><div class="g">{"".join(cell(n) for n in g)}</div>' for t,g in GROUPS)
sample=['path','portfolio','job-ready','dashboard','target','mic','plane','bolt','shield','sparkle']
tiles=''.join(f'<div class="t">{"".join(tile(n,s,72) for n in sample)}</div>' for s in ['navy','blue','yellow','tint'])
small=''.join(svg(n,size=20) for g in GROUPS[:5] for n in g[1])
HTML=f'''<html><head><style>body{{margin:0;background:#fff;font-family:Geist,Inter,sans-serif;color:#002B42}}
.w{{padding:56px 64px;width:1480px}} h1{{font:800 44px 'Bricolage Grotesque',sans-serif;margin:0 0 6px;letter-spacing:-.02em}} .s{{color:#4a6372;font-size:18px;margin-bottom:28px}}
h2{{font:700 14px Geist;letter-spacing:.08em;text-transform:uppercase;color:#0075AD;margin:30px 0 12px}}
.g{{display:grid;grid-template-columns:repeat(12,1fr);gap:10px}} .c{{border:1px solid #E1EEF5;border-radius:16px;padding:18px 6px 10px;text-align:center;background:#FBFDFF}}
.n{{font-size:12px;color:#4a6372;margin-top:8px}} .t{{display:flex;gap:14px;margin-bottom:14px}} .sm{{display:flex;flex-wrap:wrap;gap:14px;padding:16px;border-radius:14px;background:#F0FAFF}}</style></head>
<body><div class="w"><h1>Veerly icons</h1><div class="s">{len(ICONS)} icons · 24 grid · 2px round stroke · one yellow accent each · navy #002B42, blue #0075AD, yellow #FFD84D</div>
{rows}<h2>Notion tiles</h2>{tiles}<h2>At 20px</h2><div class="sm">{small}</div></div></body></html>'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg=await b.new_page(viewport={'width':1480,'height':800},device_scale_factor=2)
        await pg.set_content(HTML); await pg.evaluate('document.fonts.ready')
        await pg.screenshot(path=sys.argv[1],full_page=True)
        if len(sys.argv)>2:
            await pg.set_viewport_size({'width':1480,'height':800}); 
            pg2=await b.new_page(viewport={'width':1480,'height':800},device_scale_factor=3)
            await pg2.set_content(HTML); await pg2.screenshot(path=sys.argv[2],full_page=True)
        await b.close()
asyncio.run(main())
