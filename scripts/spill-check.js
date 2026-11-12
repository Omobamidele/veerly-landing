/* eslint-disable */
// Evaluated in the page by Playwright (page.evaluate). Flags text or icons that spill out of their box.
() => {
  const out = [];
  const desc = el => el.tagName.toLowerCase() + (typeof el.className==='string' ? '.' + el.className.trim().split(/\s+/).slice(0,5).join('.') : '');
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest('.sr-only') || el.closest('[hidden]')) continue;
    const cs = getComputedStyle(el);
    if (cs.display==='none' || cs.visibility==='hidden') continue;
    if (['auto','scroll'].includes(cs.overflowX)) continue;
    if (el.clientWidth === 0) continue;
    const boxed = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopWidth) > 0 || ['BUTTON','A','LI','INPUT','SELECT','LABEL'].includes(el.tagName);
    if (!boxed) continue;
    if (el.scrollWidth > el.clientWidth + 1) out.push({el: desc(el), by: el.scrollWidth - el.clientWidth, text: el.textContent.trim().slice(0,60)});
  }
  return out;
}
