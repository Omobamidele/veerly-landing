/* eslint-disable */
// Evaluated in the page by Playwright (page.evaluate). Flags text or icons that spill out of their box.
() => {
  const out = [];
  const desc = el => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (typeof el.className === 'string' && el.className) s += '.' + el.className.trim().split(/\s+/).slice(0,4).join('.');
    return s;
  };
  const sw = document.documentElement.scrollWidth - innerWidth;
  if (sw > 0) out.push({kind:'page-hscroll', px: sw});
  // 1. text that escapes its parent box
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest('.sr-only,[aria-hidden=true] .sr-only,script,style,noscript')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = document.createRange(); r.selectNodeContents(n);
    const tr = r.getBoundingClientRect();
    if (tr.width === 0) continue;
    // nearest block-ish ancestor with box
    let box = el;
    while (box && getComputedStyle(box).display === 'inline') box = box.parentElement;
    const br = box.getBoundingClientRect();
    const tol = 1.5;
    if (tr.right > br.right + tol || tr.left < br.left - tol)
      out.push({kind:'text-out-x', el: desc(box), text: n.textContent.trim().slice(0,40), dx: Math.round(Math.max(tr.right-br.right, br.left-tr.left))});
    if (tr.bottom > br.bottom + 3 || tr.top < br.top - 3)
      out.push({kind:'text-out-y', el: desc(box), text: n.textContent.trim().slice(0,40), dy: Math.round(Math.max(tr.bottom-br.bottom, br.top-tr.top))});
  }
  // 2. overflow inside clipped/scroll containers
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' && !['auto','scroll'].includes(cs.overflowX) && el.clientWidth>0 && !el.closest('.sr-only'))
      out.push({kind:'clipped-x', el: desc(el), by: el.scrollWidth - el.clientWidth, text: el.textContent.trim().slice(0,40)});
  }
  // 3. svg icons vertically misaligned with sibling text in flex rows
  for (const svg of document.querySelectorAll('svg')) {
    const p = svg.parentElement; if (!p) continue;

    const sr = svg.getBoundingClientRect(); if (!sr.width) continue;
    const pr = p.getBoundingClientRect();
    if (sr.right > pr.right + 1 || sr.left < pr.left - 1 || sr.bottom > pr.bottom + 1 || sr.top < pr.top - 1)
      out.push({kind:'icon-out', el: desc(p), text: p.textContent.trim().slice(0,40)});
    // icon shrunk
    const w = parseFloat(svg.getAttribute('width')||0);
    if (w && sr.width < w - 1) out.push({kind:'icon-shrunk', el: desc(p), w, got: sr.width, text: p.textContent.trim().slice(0,40)});
  }
  return out;
}
