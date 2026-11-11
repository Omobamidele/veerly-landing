import re,os,sys,asyncio,html,json
from icons import ICONS,OLD
NAVY='#002B42';BLUE='#0075AD';YEL='#FFD84D';TINT='#E6F4FB'
def svg(name,stroke=NAVY,accent=YEL,sw=2,size=None,extra=''):
    b=ICONS[name]['body'].replace('class="a"',f'fill="{accent}" stroke="none"') if accent else re.sub(r'<[^>]*class="a"[^>]*/>','',ICONS[name]['body'])
    sz=f' width="{size}" height="{size}"' if size else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"{sz} fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"{extra}>'+b.replace('currentColor',stroke)+'</svg>'
# tile styles (match cover variants)
TILES={'navy':(NAVY,'#FFFFFF',YEL),'blue':(BLUE,'#FFFFFF',YEL),'yellow':(YEL,NAVY,'#FFFFFF'),'tint':(TINT,NAVY,YEL)}
def tile(name,style,size=280):
    bg,fg,ac=TILES[style]; pad=size*0.2; inner=size-2*pad; s=inner/24
    b=ICONS[name]['body'].replace('class="a"',f'fill="{ac}" stroke="none"').replace('currentColor',fg)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">'
      f'<rect width="{size}" height="{size}" rx="{size*0.25}" fill="{bg}"/>'
      f'<g transform="translate({pad} {pad}) scale({s})" fill="none" stroke="{fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{b}</g></svg>')
if __name__=='__main__':
    out=sys.argv[1] if len(sys.argv)>1 else 'svg'
    os.makedirs(out,exist_ok=True)
    for n in ICONS: open(f'{out}/{n}.svg','w').write(svg(n)+'\n')
    print('wrote',len(ICONS))
