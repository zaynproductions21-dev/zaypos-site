// Round 3: variations on round 2's 05 · Family. Run: node generate.mjs
// Every wordmark is ZaynBot's setting exactly (lowercase Inter Tight 800, tracking
// -25) so the two sit together under ZaynIT; only the o, and where the violet goes,
// changes. Type is outlined by ../concepts/outline.py (set LOGO_PY).
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const here = new URL('.', import.meta.url).pathname
const f = n => +n.toFixed(2)
const write = (name, body) => writeFileSync(here + name, body.trim() + '\n')
const ACC = 'var(--accent, currentColor)'
const round = d => d.replace(/-?\d+\.\d+/g, n => String(f(+n)))

const IT = { font: 'InterTight.ttf', wght: 800, tracking: -25 }
const SPECS = [
  { id: 'name', text: 'zaypos', ...IT, size: 40 },
  { id: 'z', text: 'z', ...IT, size: 28 },
  { id: 'zBig', text: 'z', ...IT, size: 52 },
]
const TYPE = JSON.parse(execFileSync(process.env.LOGO_PY ?? 'python3', [here + '../concepts/outline.py'], { input: JSON.stringify(SPECS) }).toString())
const G = TYPE.name.glyphs, O = G[4]
const d = (id, a = 0, b) => round(TYPE[id].glyphs.slice(a, b).map(g => g.d).join(''))
const ink = id => TYPE[id].glyphs.reduce((r, g) => g.bbox ? [Math.min(r[0], g.bbox[0]), Math.min(r[1], g.bbox[1]), Math.max(r[2], g.bbox[2]), Math.max(r[3], g.bbox[3])] : r, [1e9, 1e9, -1e9, -1e9])
const centred = (id, cx, cy, fill = 'currentColor') => {
  const [x0, y0, x1, y1] = ink(id)
  return `<path transform="translate(${f(cx - (x0 + x1) / 2)} ${f(cy - (y0 + y1) / 2)})" fill="${fill}" d="${d(id)}"/>`
}
// The o's geometry in the word's own coordinates (baseline at 0).
const [ox0, oy0, ox1, oy1] = O.bbox, ocx = f((ox0 + ox1) / 2), ocy = f((oy0 + oy1) / 2), oR = f((oy1 - oy0) / 2)
const icon = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="ZayPOS">${body}</svg>`
// The x-height (top of the z) is centred on the mark; ascenders/descenders hang out.
const base = f(24 - G[0].bbox[1] / 2)
const X = 58
const lockup = (mark, word) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(X + TYPE.name.width + 2)} 48" role="img" aria-label="ZayPOS">${mark}<g transform="translate(${X} ${base})">${word}</g></svg>`
const all = (slug, mark, word, note) => {
  write(`${slug}.icon.svg`, icon(mark))
  write(`${slug}.lockup.svg`, lockup(mark, word))
  write(`${slug}.notes.md`, note)
}
const notO = `<path fill="currentColor" d="${d('name', 0, 4)}${d('name', 5)}"/>`
const oGlyph = fill => `<path fill="${fill}" d="${d('name', 4, 5)}"/>`
// A ring drawn to the o's outer size, for marks that need an exact circle.
const ringMark = (r, w, inner = '') => `<circle cx="24" cy="24" r="${r}" fill="none" stroke="${ACC}" stroke-width="${w}"/>${inner}`

// ── 01 · Plate ─────────────────────────────────────────────────────────────
// The real Inter Tight o in violet, counter empty: a plate seen from above.
// Icon: the plate with an ink z served on it.
all('01-plate', ringMark(16.5, 7, centred('z', 24, 24)), notO + oGlyph(ACC),
  `ZaynBot's setting with the o in violet and an empty counter: a plate from above. Icon: a z served on the plate.
Closest to round 2; the o is now the true glyph, so it matches ZaynBot's weight exactly.`)

// ── 02 · Coin ──────────────────────────────────────────────────────────────
// The o filled solid: a coin, or the till's big round pay button. Icon: the coin
// with the z cut out of it.
all('02-coin',
  `<defs><mask id="cn" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><circle cx="24" cy="24" r="20" fill="#fff"/>${centred('zBig', 24, 24, '#000')}</mask></defs><rect width="48" height="48" fill="${ACC}" mask="url(#cn)"/>`,
  notO + `<circle cx="${ocx}" cy="${ocy}" r="${oR}" fill="${ACC}"/>`,
  `The o filled solid violet: a coin, the pay button. Icon: the coin with the z cut out.
Risk: a letter in a disc is common; it relies on the wordmark.`)

// ── 03 · Button ────────────────────────────────────────────────────────────
// ZaynBot's eye, calmed down: the same violet ring, the ink dot dead centre. On
// ZaynBot the dot looks up and out (an eye); here it is the button you press.
all('03-button', `<circle cx="24" cy="24" r="16" fill="none" stroke="${ACC}" stroke-width="8"/><circle cx="24" cy="24" r="6" fill="currentColor"/>`,
  notO + oGlyph(ACC) + `<circle cx="${ocx}" cy="${ocy}" r="${f(oR * 0.36)}" fill="currentColor"/>`,
  `The closest sibling: ZaynBot's violet ring, with the ink dot dead centre. ZaynBot's dot is an eye looking out; this one is the button you press.
Risk: too close to ZaynBot to tell apart in a tab.`)

// ── 04 · Smile ─────────────────────────────────────────────────────────────
// "The POS your team will actually love using": the violet o with an ink smile in
// its lower counter. ZaynBot's o is an eye; ZayPOS's is a grin.
{
  const smile = (cx, cy, r, w) => `<path d="M${f(cx - r)} ${f(cy)}A${r} ${r} 0 0 0 ${f(cx + r)} ${f(cy)}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round"/>`
  all('04-smile', ringMark(16, 8, smile(24, 23, 6.5, 4)),
    notO + oGlyph(ACC) + smile(ocx, f(ocy - oR * 0.08), f(oR * 0.4), f(oR * 0.24)),
    `The o grins: violet ring, ink smile ("the POS your team will love using"). ZaynBot's o is an eye, ZayPOS's is a smile.
Risk: emoji territory; must stay a single arc with no eyes.`)
}

// ── 05 · POS in violet ─────────────────────────────────────────────────────
// The site's own split: zay in ink, pos in violet, the o a ring like ZaynBot's.
// Icon: an ink ring with a violet z on it.
all('05-pos-violet', `<circle cx="24" cy="24" r="16.5" fill="none" stroke="currentColor" stroke-width="7"/>${centred('z', 24, 24, ACC)}`,
  `<path fill="currentColor" d="${d('name', 0, 3)}"/><path fill="${ACC}" d="${d('name', 3)}"/>`,
  `zay in ink and pos in violet, as on the current site, set ZaynBot's way. Icon: an ink plate with a violet z.
Risk: two-colour split words are common; the icon inverts the colour logic.`)

// ── 06 · Violet z ──────────────────────────────────────────────────────────
// The accent moves to the z (Zayn's letter), everything else ink. Icon: the z
// alone, big and violet: no container at all.
all('06-violet-z', centred('zBig', 24, 24, ACC),
  `<path fill="${ACC}" d="${d('name', 0, 1)}"/><path fill="currentColor" d="${d('name', 1)}"/>`,
  `The violet moves to the z (Zayn's letter); everything else is ink. Icon: the z on its own, no container.
Risk: a lone lowercase z is plain; it needs the family to mean anything.`)
