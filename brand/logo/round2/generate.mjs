// Round 2 of the ZayPOS concepts: heavier, more playful, wordmark-led. Run: node generate.mjs
// Type is outlined by ../concepts/outline.py; set LOGO_PY to a python with fonttools + uharfbuzz.
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const here = new URL('.', import.meta.url).pathname
const f = n => +n.toFixed(2)
const write = (name, body) => writeFileSync(here + name, body.trim() + '\n')
const ACC = 'var(--accent, currentColor)'
const round = d => d.replace(/-?\d+\.\d+/g, n => String(f(+n)))

const UNB = { font: 'Unbounded.ttf', wght: 900 }
const SPECS = [
  { id: 'unb', text: 'ZAYPOS', ...UNB, size: 26, tracking: -20 },
  { id: 'unbZ', text: 'Z', ...UNB, size: 40 },
  { id: 'ticket', text: 'ZAYPOS', ...UNB, size: 22, tracking: 0 },
  { id: 'ticketZ', text: 'Z', ...UNB, size: 30 },
  { id: 'zay', text: 'ZAY', font: 'BarlowCondensed-ExtraBold.ttf', size: 25, tracking: 10 },
  { id: 'pos', text: 'POS', font: 'BarlowCondensed-ExtraBold.ttf', size: 25, tracking: 10 },
  { id: 'cond', text: 'ZAYPOS', font: 'BarlowCondensed-ExtraBold.ttf', size: 38, tracking: 20 },
  { id: 'lower', text: 'zaypos', font: 'InterTight.ttf', wght: 900, size: 40, tracking: -40 },
  { id: 'lowerZ', text: 'z', font: 'InterTight.ttf', wght: 900, size: 30 },
]
const TYPE = JSON.parse(execFileSync(process.env.LOGO_PY ?? 'python3', [here + '../concepts/outline.py'], { input: JSON.stringify(SPECS) }).toString())
const T = id => TYPE[id]
const glyphD = (id, a = 0, b) => round(T(id).glyphs.slice(a, b).map(g => g.d).join(''))
// Ink extents of a run: [x0, top, x1, bottom] relative to its origin/baseline.
const ink = id => T(id).glyphs.reduce((r, g) => g.bbox ? [Math.min(r[0], g.bbox[0]), Math.min(r[1], g.bbox[1]), Math.max(r[2], g.bbox[2]), Math.max(r[3], g.bbox[3])] : r, [1e9, 1e9, -1e9, -1e9])
const icon = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="ZayPOS">${body}</svg>`
const lockup = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${h}" role="img" aria-label="ZayPOS">${body}</svg>`
// Centre a single outlined glyph run in a box.
const centred = (id, cx, cy, fill = 'currentColor') => {
  const [x0, y0, x1, y1] = ink(id)
  return `<path transform="translate(${f(cx - (x0 + x1) / 2)} ${f(cy - (y0 + y1) / 2)})" fill="${fill}" d="${glyphD(id)}"/>`
}

// ── 01 · Dot matrix ────────────────────────────────────────────────────────
// The name as a till's customer display / dot-matrix receipt print, every letter
// hand-set on a 5×7 grid of round dots. POS lights up violet.
{
  const G = {
    Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  }
  const dots = (rows, x, y, c, r) => rows.flatMap((row, j) => [...row].map((b, i) => b === '1' ? `M${f(x + i * c + c / 2 - r)} ${f(y + j * c + c / 2)}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0Z` : '')).join('')
  // Icon: a 5×5 Z (the 7-row Z squashed) with fat dots, so it holds at 16px.
  const z5 = ['11111', '00010', '00100', '01000', '11111']
  write('01-dot-matrix.icon.svg', icon(`<path fill="${ACC}" d="${dots(z5, 4, 4, 8, 3.6)}"/>`))
  const c = 5, r = 2.4, adv = 6 * c, x0 = 58, y0 = f(24 - 3.5 * c)
  const word = (letters, start) => [...letters].map((l, i) => dots(G[l], x0 + (start + i) * adv, y0, c, r)).join('')
  write('01-dot-matrix.lockup.svg', lockup(x0 + 6 * adv - c + 2, 48,
    `<path fill="${ACC}" d="${dots(z5, 4, 4, 8, 3.6)}"/><path fill="currentColor" d="${word('ZAY', 0)}"/><path fill="${ACC}" d="${word('POS', 3)}"/>`))
  write('01-dot-matrix.notes.md', `The name as a till display or a dot-matrix receipt: every letter hand-set in round dots, POS lit violet. Icon: a fat-dot Z.
Risk: dot type can feel retro-tech rather than café; it needs the violet to stay friendly.`)
}

// ── 02 · Ticket ────────────────────────────────────────────────────────────
// The whole name knocked out of a violet ticket with torn zigzag ends: an order
// ticket / receipt strip. Icon: a square stub of the same ticket with a Z.
{
  // Ticket outline: torn zigzag ends with n teeth of `depth`; the left edge runs bottom→top.
  const ticketPath = (x0, y0, x1, y1, n, depth) => {
    const h = (y1 - y0) / n
    let right = '', left = ''
    for (let i = 0; i < n; i++) right += `L${f(x1 - depth)} ${f(y0 + i * h + h / 2)}L${x1} ${f(y0 + (i + 1) * h)}`
    for (let i = 0; i < n; i++) left += `L${f(x0 + depth)} ${f(y1 - i * h - h / 2)}L${x0} ${f(y1 - (i + 1) * h)}`
    return `M${x0} ${y0}H${x1}${right}H${x0}${left}Z`
  }
  const mask = (id, w, h, shape, cut) => `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><path fill="#fff" d="${shape}"/>${cut}</mask></defs><rect width="${w}" height="${h}" fill="${ACC}" mask="url(#${id})"/>`
  write('02-ticket.icon.svg', icon(mask('tk', 48, 48, ticketPath(4, 6, 44, 42, 4, 4), centred('ticketZ', 24, 24, '#000'))))
  const [tx0, , tx1] = ink('ticket'), tw = tx1 - tx0, W = f(tw + 36)
  write('02-ticket.lockup.svg', lockup(W, 48, mask('tkl', W, 48, ticketPath(0, 6, W, 42, 4, 4), centred('ticket', W / 2, 24, '#000'))))
  write('02-ticket.notes.md', `The whole name knocked out of a violet order ticket with torn zigzag ends. One shape, no separate icon in the lockup. Unbounded Black.
Risk: a badge-style logo needs room; it is the nav's loudest thing.`)
}

// ── 03 · Full stop ─────────────────────────────────────────────────────────
// ZAYPOS in Unbounded Black, the O swapped for a solid violet disc: the till's big
// round "pay" button. Icon: the Z with the same disc as a full stop.
{
  const g = T('unb').glyphs, o = g[4], [, top, , bot] = ink('unb'), base = f(24 - (top + bot) / 2)
  const r = (o.bbox[3] - o.bbox[1]) / 2, cx = o.x + (o.bbox[0] - o.x + o.bbox[2] - o.x) / 2, cy = (o.bbox[1] + o.bbox[3]) / 2
  const word = `<g transform="translate(58 ${base})"><path fill="currentColor" d="${glyphD('unb', 0, 4)}${glyphD('unb', 5)}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${ACC}"/></g>`
  const [zx0, zy0, zx1, zy1] = ink('unbZ'), zh = zy1 - zy0, zw = zx1 - zx0
  const mark = `<path transform="translate(${f(5 - zx0)} ${f(24 - (zy0 + zy1) / 2 - 3)})" fill="currentColor" d="${glyphD('unbZ')}"/><circle cx="${f(5 + zw + 6.5)}" cy="${f(24 + zh / 2 - 3 - 5.5)}" r="5.5" fill="${ACC}"/>`
  write('03-full-stop.icon.svg', icon(mark))
  write('03-full-stop.lockup.svg', lockup(58 + T('unb').width + 2, 48, mark + word))
  write('03-full-stop.notes.md', `ZAYPOS in Unbounded Black with the O as a solid violet disc: the big round pay button. Icon: Z plus the disc as a full stop ("done").
Risk: a coloured O is a common wordmark move; the disc has to be exactly the O's size.`)
}

// ── 04 · Stacked block ─────────────────────────────────────────────────────
// ZAY over POS in heavy condensed caps inside a thick frame, like the price
// sticker on a till or a kitchen-ticket header. The block is the icon; the
// lockup sets the name on one line in the same frame.
{
  const frame = (x, y, w, h) => `<rect x="${x + 1.75}" y="${y + 1.75}" width="${w - 3.5}" height="${h - 3.5}" rx="3" fill="none" stroke="currentColor" stroke-width="3.5"/>`
  // POS is cut out of the violet block with a mask, so it stays a hole in mono.
  const block = (id, w, d, cut) => `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="48"><path fill="#fff" d="${d}"/>${cut}</mask></defs><rect width="${w}" height="48" fill="${ACC}" mask="url(#${id})"/>`
  write('04-stacked.icon.svg', icon(block('stk', 48, 'M3 24.5H45V42A3 3 0 0 1 42 45H6A3 3 0 0 1 3 42Z', centred('pos', 24, 34.5, '#000')) + frame(3, 3, 42, 42) + centred('zay', 24, 14)))
  const [cx0, cy0, cx1, cy1] = ink('cond'), W = f(cx1 - cx0 + 24), tx = f(12 - cx0), ty = f(24 - (cy0 + cy1) / 2)
  // One line: ZAY on the page, POS cut out of a violet block, all inside the frame.
  const g = T('cond').glyphs, split = f(tx + (g[2].bbox[2] + g[3].bbox[0]) / 2)
  write('04-stacked.lockup.svg', lockup(W, 48,
    block('stl', W, `M${split} 3H${f(W - 6)}A3 3 0 0 1 ${f(W - 3)} 6V42A3 3 0 0 1 ${f(W - 6)} 45H${split}Z`, `<path transform="translate(${tx} ${ty})" fill="#000" d="${glyphD('cond', 3)}"/>`) +
    frame(3, 3, W - 6, 42) + `<path transform="translate(${tx} ${ty})" fill="currentColor" d="${glyphD('cond', 0, 3)}"/>`))
  write('04-stacked.notes.md', `ZAY over POS in heavy condensed caps in a thick frame, POS reversed out of violet: a till's price sticker. One line in the nav, stacked as the icon.
Risk: two blocks of type in a box is busy below 24px; at 16px it is a framed smudge.`)
}

// ── 05 · Family ────────────────────────────────────────────────────────────
// Sibling to ZaynBot: lowercase Inter Tight Black, the o drawn as a violet ring
// (a plate seen from above, no pupil). Icon: the ring with a z on it.
{
  const g = T('lower').glyphs, o = g[4], [, top, , bot] = ink('lower'), base = f(24 - (top + bot) / 2 + 1)
  const [ox0, oy0, ox1, oy1] = o.bbox, cx = (ox0 + ox1) / 2, cy = (oy0 + oy1) / 2, R = (oy1 - oy0) / 2, sw = 6
  const word = `<g transform="translate(58 ${base})"><path fill="currentColor" d="${glyphD('lower', 0, 4)}${glyphD('lower', 5)}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R - sw / 2)}" fill="none" stroke="${ACC}" stroke-width="${sw}"/></g>`
  const mark = `<circle cx="24" cy="24" r="17" fill="none" stroke="${ACC}" stroke-width="8"/>${centred('lowerZ', 24, 24)}`
  write('05-family.icon.svg', icon(mark))
  write('05-family.lockup.svg', lockup(58 + T('lower').width + 2, 48, mark + word))
  write('05-family.notes.md', `A sibling of ZaynBot: lowercase Inter Tight Black, the o as a violet ring (a plate from above). Icon: the ring with a z on the plate.
Risk: it leans on the family; on its own it is a ring and a letter.`)
}
