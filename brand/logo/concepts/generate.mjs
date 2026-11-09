// Generates the ZayPOS concept SVGs on exact grids. Run: node generate.mjs
// Lockup type is outlined by outline.py (fonttools + harfbuzz); set LOGO_PY to a
// python that has both installed, e.g. LOGO_PY=<venv>/bin/python node generate.mjs
// Ink is currentColor, violet is var(--accent): every file also renders in one colour.
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const here = new URL('.', import.meta.url).pathname
const f = n => +n.toFixed(2)
const write = (name, body) => writeFileSync(here + name, body.trim() + '\n')
const ACC = 'var(--accent, currentColor)'
const round = d => d.replace(/-?\d+\.\d+/g, n => String(f(+n)))

const BRIC = { font: 'BricolageGrotesque.ttf', wght: 800, axes: { opsz: 48, wdth: 88 }, size: 34, tracking: -10 }
const FRAU = { font: 'Fraunces.ttf', wght: 900, axes: { opsz: 72, SOFT: 100, WONK: 0 }, size: 36, tracking: -15 }
const SPECS = [
  { id: 'bric', text: 'ZayPOS', ...BRIC },
  { id: 'frau', text: 'ZayPOS', ...FRAU },
  { id: 'frauZ', text: 'Z', ...FRAU, size: 44 },
]
const TYPE = JSON.parse(execFileSync(process.env.LOGO_PY ?? 'python3', [here + 'outline.py'], { input: JSON.stringify(SPECS) }).toString())
const width = id => TYPE[id].width
// The name with "POS" in the accent, as on the current site; baseline chosen so the
// cap height is centred on the 48-unit mark.
const capTop = id => TYPE[id].glyphs[0].bbox[1]
const name = (id, x) => {
  const y = f(24 - capTop(id) / 2)
  const g = TYPE[id].glyphs
  const part = (a, b) => round(g.slice(a, b).map(gl => gl.d).join(''))
  return { y, svg: `<g transform="translate(${x} ${y})"><path fill="currentColor" d="${part(0, 3)}"/><path fill="${ACC}" d="${part(3)}"/></g>` }
}
const icon = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="ZayPOS">${body}</svg>`
const all = (slug, mark, note, typeId = 'bric', x = 58) => {
  write(`${slug}.icon.svg`, icon(mark))
  write(`${slug}.lockup.svg`, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(x + width(typeId) + 2)} 48" role="img" aria-label="ZayPOS">
  ${mark}
  ${name(typeId, x).svg}
</svg>`)
  write(`${slug}.notes.md`, note)
}
const masked = (id, shape, cuts, fill = ACC) => `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">${shape}${cuts}</mask></defs><rect width="48" height="48" fill="${fill}" mask="url(#${id})"/>`
// The Z as one mitred stroke from (x0,y0) to (x1,y1).
const zStroke = (x0, y0, x1, y1, w, colour = '#000') => `<path d="M${x0} ${y0}H${x1}L${x0} ${y1}H${x1}" fill="none" stroke="${colour}" stroke-width="${w}" stroke-linejoin="miter" stroke-miterlimit="10" stroke-linecap="butt"/>`

// ── 01 · Folded Z ──────────────────────────────────────────────────────────
// A receipt strip folded twice: top and bottom panels in ink, the diagonal (the
// paper's underside showing through the fold) in violet. Three separate paths so
// nothing cancels by winding.
all('01-folded-z',
  `<path fill="currentColor" d="M6 7H42V19H6Z"/>` +
  `<path fill="${ACC}" d="M29 19H42L19 29H6Z"/>` +
  `<path fill="currentColor" d="M6 29H42V41H6Z"/>`,
  `A strip of receipt paper folded twice makes a Z: ink panels, violet fold. Bricolage Grotesque ExtraBold, POS in violet.
Risk: at a glance it is a plain Z; the fold has to be read.`)

// ── 02 · Receipt ───────────────────────────────────────────────────────────
// A receipt slip with a torn zigzag foot (four teeth), the Z cut through it.
{
  let tear = '' // from (38,40) back to (10,40)
  for (let i = 3; i >= 0; i--) tear += `L${f(10 + i * 7 + 3.5)} 44L${10 + i * 7} 40`
  all('02-receipt', masked('rc', `<path fill="#fff" d="M10 4H38V40${tear}Z"/>`, zStroke(17, 13, 31, 31, 4.5)),
    `A receipt slip with a torn zigzag foot, the Z cut out of it. Fraunces Black (soft), the site's own serif, POS in violet.
Risk: a document icon with a letter on it can look generic.`, 'frau')
}

// ── 03 · Keypad Z ──────────────────────────────────────────────────────────
// A 3×3 keypad of dots; the Z is traced through seven of them in one round stroke,
// the two keys it misses stay as dots.
all('03-keypad-z',
  `<path d="M10 10H38L10 38H38" fill="none" stroke="${ACC}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<circle cx="10" cy="24" r="3.5" fill="currentColor"/><circle cx="38" cy="24" r="3.5" fill="currentColor"/>`,
  `A till keypad of nine keys with the Z traced through seven in one stroke. Bricolage Grotesque ExtraBold.
Risk: close to a phone unlock pattern.`)

// ── 04 · Y-tail ────────────────────────────────────────────────────────────
// Typographic: Fraunces Black, the y's descender swung out under POS as a total
// line. Icon is the Fraunces Z standing on the same violet line.
{
  const T = TYPE.frau, g = T.glyphs
  const y = g.find(gl => gl.char === 'y'), s = g[g.length - 1]
  const base = f(24 - capTop('frau') / 2) + 4
  // The line sits on the tail's lowest point and starts under its ball terminal, in
  // ink, so the tail appears to swing right and run out under POS.
  const lineY = f(base + y.bbox[3] - 4.2), x0 = f(y.bbox[0] + 2), x1 = f(s.x + s.bbox[2])
  const Z = TYPE.frauZ.glyphs[0], zw = Z.bbox[2] - Z.bbox[0], zh = Z.bbox[3] - Z.bbox[1]
  const zx = f(24 - zw / 2 - Z.bbox[0]), zy = f(4 - Z.bbox[1])
  const mark = `<path transform="translate(${zx} ${zy})" fill="currentColor" d="${round(Z.d)}"/><path fill="${ACC}" d="M${f(24 - zw / 2)} ${f(4 + zh + 3)}h${f(zw)}v4.5h${f(-zw)}Z"/>`
  write('04-y-tail.icon.svg', icon(mark))
  const part = (a, b) => round(g.slice(a, b).map(gl => gl.d).join(''))
  write('04-y-tail.lockup.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(T.width + 2)} 52" role="img" aria-label="ZayPOS">
  <g transform="translate(0 ${base})"><path fill="currentColor" d="${part(0, 3)}"/><path fill="${ACC}" d="${part(3)}"/></g>
  <path fill="currentColor" d="M${x0} ${lineY}H${x1}V${f(lineY + 4.2)}H${x0}Z"/>
</svg>`)
  write('04-y-tail.notes.md', `Typographic: ZayPOS in Fraunces Black, the y's tail run out under POS like the total line on a bill. Icon: the Z on that line.
Risk: the tail join is a drawing job; it reads as an underline if it is not convincing.`)
}

// ── 05 · Coin Z ────────────────────────────────────────────────────────────
// A solid violet disc (a coin, a plate) with a fat Z cut straight through it.
all('05-coin-z', masked('cn', `<circle cx="24" cy="24" r="21" fill="#fff"/>`, zStroke(14, 14.5, 34, 33.5, 6)),
  `A coin or a plate with a fat Z cut through it: built for the circle avatar and the tab. Bricolage Grotesque ExtraBold.
Risk: discs with a letter are common; the Z cut has to be big and bold.`)
