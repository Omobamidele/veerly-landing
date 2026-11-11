import re
from icons import ICONS
def pascal(n): return ''.join(p.capitalize() for p in n.split('-'))
def jsx(body):
    b=body.replace('class="a"','fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent=""')
    b=b.replace('stroke-width=','strokeWidth=')
    return b
out=['// Veerly icon set. Hand-drawn on a 24 grid for Veerly; generated from brand-src/icons (do not edit by hand).',
'// Navy/blue stroke via currentColor, one yellow accent per icon (set --veerly-icon-accent or pass accent={false}).',
'import * as React from "react"','',
'export type VeerlyIconProps = React.SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string; accent?: boolean }','',
'function make(name: string, render: (accent: boolean) => React.ReactNode) {',
'  const Icon = React.forwardRef<SVGSVGElement, VeerlyIconProps>(function VeerlyIcon(',
'    { size = 24, strokeWidth = 2, accent = true, className, ...props }, ref) {',
'    return (',
'      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"',
'        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"',
'        aria-hidden={props["aria-label"] ? undefined : true} data-veerly-icon={name}',
'        className={["veerly-icon", className].filter(Boolean).join(" ")} {...props}>',
'        {render(accent)}',
'      </svg>',
'    )',
'  })',
'  Icon.displayName = `Icon${name}`',
'  return Icon',
'}','']
for n,d in ICONS.items():
    parts=re.findall(r'<[^>]+/>|<g[^>]*>|</g>',d['body'])
    # rebuild with accent conditional
    if 'class="a"' in d['body']:
        # wrap accent elements
        b=re.sub(r'(<[^>]*class="a"[^>]*/>)',lambda m:'{accent && '+jsx(m.group(1))+'}',d['body'])
        b=b.replace('stroke-width=','strokeWidth=')
    else: b=jsx(d['body'])
    b=b.replace('fill="currentColor"','fill="currentColor"')
    out.append(f'/** {d["concept"]} */')
    arg='(accent)' if 'class="a"' in d['body'] else '()'
    out.append(f'export const Icon{pascal(n)} = make("{pascal(n)}", {arg} => <>{b}</>)')
out.append('')
out.append('export const veerlyIcons = {'+', '.join(f'"{n}": Icon{pascal(n)}' for n in ICONS)+'} as const')
out.append('export type VeerlyIconName = keyof typeof veerlyIcons')
open('/workspace/veerly-landing/components/icons/veerly-icons.tsx','w').write('\n'.join(out)+'\n')
