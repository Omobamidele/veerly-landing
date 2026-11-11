import json,sys,asyncio,base64,html,re
sys.path.insert(0,'/workspace/veerly-icons')
from icons import ICONS,OLD
from playwright.async_api import async_playwright
E=json.load(open('manifest.json')); G=json.load(open('glyphs.json'))
B='/workspace/veerly-landing/public/brand/'
def b64(p): return 'data:image/svg+xml;base64,'+base64.b64encode(open(p,'rb').read()).decode()
LOGO_W=b64(B+'veerly-logo-white.svg'); LOGO=b64(B+'veerly-logo.svg'); DOT=b64(B+'dot.svg')
APP=open('/workspace/veerly-landing/app/icon.svg').read()
NAVY='#002B42'; BLUE='#0075AD'; YEL='#FFD84D'
V={'home':dict(bg=NAVY,fg='#fff',sub='#BFE3F5',logo=LOGO_W,pill=(YEL,NAVY)),
   'section':dict(bg=BLUE,fg='#fff',sub='#DDF1FB',logo=LOGO_W,pill=(YEL,NAVY)),
   'project':dict(bg=NAVY,fg='#fff',sub='#BFE3F5',logo=LOGO_W,pill=(BLUE,'#fff')),
   'tracker':dict(bg=YEL,fg=NAVY,sub='#3d4f5a',logo=LOGO,pill=(NAVY,YEL)),
   'resource':dict(bg='#F0FAFF',fg=NAVY,sub='#4a6372',logo=LOGO,pill=(BLUE,'#fff'))}
ACC={'#fff':YEL,YEL:'#fff','#3DA9DE':YEL}
def glyph(name,color,sw=2):
    b=ICONS[OLD[name]]['body'].replace('class="a"',f'fill="{ACC.get(color,YEL)}" stroke="none"').replace('currentColor',color)
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%">{b}</svg>'
FLAG=lambda c,w: f'<svg viewBox="21.5 6 7.5 5.5" width="{w}" style="display:block"><path d="M21.5 6H29v5.5h-5.3z" fill="{c}"/></svg>'
VMARK=lambda c,f,w: f'<svg viewBox="2 5 28 22" width="{w}"><path d="M3 6h6.5l6 13.5L21.5 6h4.2l-7.2 20h-6z" fill="{c}"/><path d="M21.5 6H29v5.5h-5.3z" fill="{f}"/></svg>'
def art(e,v):
    k=e['variant']
    if k=='home':
        return f'''<div style="position:absolute;right:-40px;top:50%;transform:translateY(-50%);width:640px;height:640px;border-radius:50%;background:{BLUE}"></div>
<div style="position:absolute;left:-60px;bottom:-70px;opacity:.07">{VMARK('#fff','#fff',420)}</div>
<img src="{DOT}" style="position:absolute;right:120px;top:50%;transform:translateY(-46%);height:330px">'''
    if k=='section':
        return f'''<div style="position:absolute;right:-120px;top:-60px;opacity:.13">{VMARK('#fff','#fff',760)}</div>
<div style="position:absolute;right:170px;top:50%;transform:translateY(-50%);width:250px;height:250px;border-radius:56px;background:{NAVY};box-shadow:0 30px 60px rgba(0,30,50,.35);display:flex;align-items:center;justify-content:center"><div style="width:130px;height:130px">{glyph(e['glyph'],'#fff',1.75)}</div></div>
<div style="position:absolute;right:140px;top:150px;transform:translateY(0)">{FLAG(YEL,96)}</div>'''
    if k=='project':
        return f'''<div style="position:absolute;right:-60px;top:50%;transform:translateY(-50%);width:600px;height:600px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#0a4a6e,{NAVY} 70%)"></div>
<div style="position:absolute;right:150px;top:50%;transform:translateY(-50%);width:300px;height:300px">{glyph(e['glyph'],'#3DA9DE',1.5)}</div>
<div style="position:absolute;right:96px;top:118px">{FLAG(YEL,84)}</div>'''
    if k=='tracker':
        return f'''<div style="position:absolute;right:-90px;bottom:-140px;opacity:.12">{VMARK(NAVY,NAVY,700)}</div>
<div style="position:absolute;right:170px;top:50%;transform:translateY(-50%);width:250px;height:250px;border-radius:56px;background:{NAVY};box-shadow:0 30px 60px rgba(0,43,66,.25);display:flex;align-items:center;justify-content:center"><div style="width:130px;height:130px">{glyph(e['glyph'],YEL,1.75)}</div></div>'''
    return f'''<div style="position:absolute;inset:0;background-image:radial-gradient(#b7dcef 1.6px,transparent 1.6px);background-size:28px 28px;opacity:.7;-webkit-mask-image:linear-gradient(90deg,transparent 35%,#000 75%)"></div>
<div style="position:absolute;right:170px;top:50%;transform:translateY(-50%);width:240px;height:240px;border-radius:54px;background:{BLUE};box-shadow:0 26px 50px rgba(0,117,173,.25);display:flex;align-items:center;justify-content:center"><div style="width:124px;height:124px">{glyph(e['glyph'],'#fff',1.75)}</div></div>
<div style="position:absolute;right:140px;top:162px">{FLAG(YEL,90)}</div>'''
def page(e):
    v=V[e['variant']]; t=html.escape(e['title']); size=84 if len(t)<20 else 70 if len(t)<30 else 58 if len(t)<42 else 50
    pb,pf=v['pill']
    sub=f'<div style="margin-top:18px;font:500 27px Geist;color:{v["sub"]}">{html.escape(e["sub"])}</div>' if e['sub'] else ''
    return f'''<html><head><style>body{{margin:0}}*{{box-sizing:border-box}}</style></head><body>
<div style="position:relative;width:1500px;height:600px;overflow:hidden;background:{v['bg']}">{art(e,v)}
<div style="position:absolute;left:120px;top:50%;transform:translateY(-50%);width:780px">
<img src="{v['logo']}" style="height:40px;display:block;margin-bottom:22px">
<div style="display:inline-block;padding:7px 16px;border-radius:999px;background:{pb};color:{pf};font:700 19px Geist;letter-spacing:.06em;text-transform:uppercase;margin-bottom:16px">{html.escape(e['eyebrow'])}</div>
<div style="font:800 {size}px/1.02 'Bricolage Grotesque';color:{v['fg']};letter-spacing:-.02em">{t}</div>{sub}
</div></div></body></html>'''
def icon_html(e):
    if e['glyph']=='app': svg=APP.replace('<svg ','<svg width="512" height="512" ')
    else: svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512"><rect width="32" height="32" rx="8" fill="{BLUE}"/><g transform="translate(6 6) scale(.8333)"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{G[e['glyph']]}</svg></g><path d="M25 0h7v6.2l-4.6-.2z" fill="{YEL}" opacity="0"/></svg>'''
    return f'<html><body style="margin:0;background:transparent">{svg}</body></html>'
async def main(only):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg=await b.new_page(viewport={'width':1500,'height':600})
        ip=await b.new_page(viewport={'width':512,'height':512})
        import os; os.makedirs('out/covers2',exist_ok=True)
        done=set()
        for e in E:
            if only and e['slug'] not in only: continue
            await pg.set_content(page(e)); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(80)
            await pg.screenshot(path=f"out/covers2/{e['slug']}.png")
            gname='veerly-app' if e['glyph']=='app' else e['glyph']
        await b.close()
asyncio.run(main(set(sys.argv[1:])))
