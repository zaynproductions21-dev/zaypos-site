// Builds the final ZayPOS logo files from one set of geometry (round 3 · 02
// "Coin": ZaynBot's lowercase Inter Tight setting, "zaypos" whose o is a solid
// violet coin; the mark is the coin with the z cut out of it).
// Run: LOGO_PY=<venv>/bin/python node brand/logo/final/build.mjs [--install]
//   LOGO_PY needs fonttools + uharfbuzz (see ../concepts/outline.py). Without it the
//   outlined type is read back from geometry.json, so the build still runs.
// --install also rewrites the site: the nav and footer logo markup in every *.html
// page (the legacy "Z" tile markups, and its own output, so it is safe to rerun),
// one favicon <link> set per page, the schema.org logo URL, and favicon.svg,
// favicon.ico, apple-touch-icon.png and brand/logo-512.png at the site root.
// Needs Google Chrome for the PNG/ICO exports.
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const here = new URL('.', import.meta.url).pathname
const root = join(here, '../../..')
const install = process.argv.includes('--install')
const f = n => +n.toFixed(2)
const round = d => d.replace(/-?\d+\.\d+/g, n => String(f(+n)))

export const INK = '#1A1208' // --text
export const ACCENT = '#5B3EF5' // --violet
export const ACCENT_ON_DARK = '#A78BFA' // the footer's violet, on #1A1208
export const PAPER = '#FDFAF6' // --cream

// ── Outlined type ──────────────────────────────────────────────────────────
// ZaynBot's exact setting, so the two wordmarks sit together under ZaynIT.
const SPECS = [
  { id: 'name', font: 'InterTight.ttf', wght: 800, text: 'zaypos', size: 100, tracking: -25 },
  { id: 'z', font: 'InterTight.ttf', wght: 800, text: 'z', size: 52 },
]
const geoFile = join(here, 'geometry.json')
let TYPE
try {
  TYPE = JSON.parse(execFileSync(process.env.LOGO_PY ?? 'python3', [join(here, '../concepts/outline.py')], { input: JSON.stringify(SPECS), stdio: ['pipe', 'pipe', 'ignore'] }).toString())
} catch {
  if (!existsSync(geoFile)) throw new Error('outline.py failed and there is no geometry.json; set LOGO_PY')
  TYPE = JSON.parse(readFileSync(geoFile, 'utf8')).type
  console.log('outliner unavailable: using geometry.json')
}

// ── Wordmark ───────────────────────────────────────────────────────────────
// Every glyph but the o in ink; the o replaced by a solid disc the size of the
// o's outer contour (overshoot included), so it sits on the same optical line.
const gl = TYPE.name.glyphs, o = gl.find(g => g.char === 'o')
const [ox0, oy0, ox1, oy1] = o.bbox
const COIN = { cx: f((ox0 + ox1) / 2), cy: f((oy0 + oy1) / 2), r: f((oy1 - oy0) / 2) }
const INK_D = round(gl.filter(g => g !== o).map(g => g.d).join(''))
const xs = gl.filter(g => g.bbox).flatMap(g => [g.bbox[0], g.bbox[2]]), ys = gl.filter(g => g.bbox).flatMap(g => [g.bbox[1], g.bbox[3]])
const PAD = 2
const WORD_VB = [f(Math.min(...xs) - PAD), f(Math.min(...ys) - PAD), f(Math.max(...xs) - Math.min(...xs) + 2 * PAD), f(Math.max(...ys) - Math.min(...ys) + 2 * PAD)]
const wordmarkBody = (ink, coin) => `<path fill="${ink}" d="${INK_D}"/><circle cx="${COIN.cx}" cy="${COIN.cy}" r="${COIN.r}" fill="${coin}"/>`
const wordmark = (ink, coin, attrs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORD_VB.join(' ')}"${attrs} role="img" aria-label="ZayPOS">${wordmarkBody(ink, coin)}</svg>\n`

// ── Mark: the coin ─────────────────────────────────────────────────────────
// 48 grid. A disc r 20 with the Inter Tight z (52 units) centred in it. With a
// `z` fill the z is drawn over the disc (so it reads on any tab colour); without
// one, disc and z are a single even-odd path and the z is a true hole (mono).
const zg = TYPE.z.glyphs[0], [zx0, zy0, zx1, zy1] = zg.bbox
// Move an absolute path (as SVGPathPen writes it: M L Q C H V Z) by dx, dy.
const shift = (d, dx, dy) => d.replace(/([MLQCHVZ])([^MLQCHVZ]*)/g, (m, c, args) => {
  const n = args.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
  const moved = c === 'H' ? n.map(v => v + dx) : c === 'V' ? n.map(v => v + dy) : n.map((v, i) => v + (i % 2 ? dy : dx))
  return c + moved.map(f).join(' ')
})
const Z_D = round(shift(zg.d, 24 - (zx0 + zx1) / 2, 24 - (zy0 + zy1) / 2))
const DISC = 'M4 24a20 20 0 1 0 40 0a20 20 0 1 0 -40 0Z'
const markBody = (coin, z) => z
  ? `<path fill="${coin}" d="${DISC}"/><path fill="${z}" d="${Z_D}"/>`
  : `<path fill="${coin}" fill-rule="evenodd" d="${DISC}${Z_D}"/>`
const mark = (coin, z) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="ZayPOS">${markBody(coin, z)}</svg>\n`

const out = {
  'logo.svg': wordmark(INK, ACCENT),
  'logo-reversed.svg': wordmark('#fff', ACCENT_ON_DARK),
  'logo-mono-black.svg': wordmark('#000', '#000'),
  'logo-mono-white.svg': wordmark('#fff', '#fff'),
  'mark.svg': mark(ACCENT, '#fff'),
  'mark-reversed.svg': mark(ACCENT_ON_DARK, INK),
  'mark-mono.svg': mark('#000'),
  'mark-mono-white.svg': mark('#fff'),
  'icon.svg': mark(ACCENT, '#fff'),
}
for (const [file, svg] of Object.entries(out)) writeFileSync(join(here, file), svg)
writeFileSync(join(here, 'usage.md'), `# ZayPOS logo: usage

**Wordmark:** \`logo.svg\`, lowercase \`zaypos\` in outlined Inter Tight ExtraBold, set exactly like ZaynBot's so the ZaynIT products read as one family. The \`o\` is a solid violet coin: the till's pay button. Use it wherever the name appears: the nav, the footer, receipts, emails, invoices.
**Mark:** \`mark.svg\`, the coin on its own with the z cut out of it. Use it for the favicon, app icon, social avatar and the receipt-printer logo. Don't put it next to the wordmark; the wordmark already has the coin.

The type is Inter Tight (SIL Open Font License, \`../fonts/OFL-InterTight.txt\`), outlined so no file needs the font. Family rule: every ZaynIT product uses this setting, and only its \`o\` changes (ZaynBot's is an eye, ZayPOS's is a coin).

## Colour
| Ground | Letters | Coin | z in the mark |
|---|---|---|---|
| Light (cream \`${PAPER}\`, white) | ink \`${INK}\` | violet \`${ACCENT}\` | white |
| Dark (\`${INK}\`) | \`#ffffff\` | light violet \`${ACCENT_ON_DARK}\` | ink \`${INK}\` |
| Thermal receipt, photo, one-colour print | all \`#000\` or all \`#fff\` (the mono files; the z is a true hole) | | |

The coin is the only colour in the wordmark: never colour other letters (the old violet "POS" is retired), never use a gradient or a tile.

## Size and space
- Wordmark minimum: **18px tall** on screen, **18mm wide** in print. The site nav and footers use 26px.
- Mark minimum: **16px**.
- Clear space on every side: the diameter of the coin.

## Don't
- Capitalise it ("ZayPOS" stays the name in text; the logo is lowercase), retype it, or set it in another font.
- Turn the coin back into a ring, add a £ or a highlight to it, or put the mark in a tile.
- Stretch it, add letter-spacing, or outline it.
- Hand-edit the SVG paths or the page markup: change \`build.mjs\` and run \`LOGO_PY=<venv>/bin/python node brand/logo/final/build.mjs --install\`.

## Files
\`logo.svg\`, \`logo-reversed.svg\`, \`logo-mono-black.svg\`, \`logo-mono-white.svg\`, \`logo@2x.png\`, \`mark.svg\`, \`mark-reversed.svg\`, \`mark-mono.svg\`, \`mark-mono-white.svg\`, \`icon.svg\`, \`favicon.ico\` (16/32/48), \`apple-touch-icon.png\`, \`geometry.json\` (the outlined type, so the build runs without fonttools).

Written into the site by \`--install\`: the inline wordmark in every page's nav and dark footer (the trial page's centred logo too), one favicon link set per page (replacing the old inline base64 "Z" tiles), \`favicon.svg\`, \`favicon.ico\`, \`apple-touch-icon.png\`, \`brand/logo-512.png\`, and the schema.org publisher logo URL on the news pages.
`)
writeFileSync(geoFile, JSON.stringify({ wordViewBox: WORD_VB, inkPath: INK_D, coin: COIN, zPath: Z_D, type: TYPE }, null, 2))

// ── Raster exports via headless Chrome ────────────────────────────────────
// The old --headless mode: --headless=new hangs on this machine. Each shot has a timeout.
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const tmp = join(tmpdir(), 'zp-logo-build'); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp)
const png = (svg, w, h, file) => {
  const html = join(tmp, file + '.html')
  writeFileSync(html, `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${w}px;height:${h}px}</style>${svg}`)
  const args = ['--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--default-background-color=00000000', `--window-size=${w},${h}`, `--screenshot=${join(tmp, file)}`, `file://${html}`]
  // Chrome occasionally hangs on a shot; one retry has always been enough.
  for (let attempt = 1; ; attempt++) {
    try { execFileSync(chrome, args, { stdio: 'ignore', timeout: 30000 }); break } catch (e) { if (attempt === 3) throw e }
  }
  return readFileSync(join(tmp, file))
}
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 68 68"><rect x="-10" y="-10" width="68" height="68" fill="${PAPER}"/>${markBody(ACCENT, '#fff')}</svg>`
const lh = 160, lw = Math.round(lh * WORD_VB[2] / WORD_VB[3])
writeFileSync(join(here, 'logo@2x.png'), png(out['logo.svg'], lw, lh, 'word.png'))
const apple = png(appleSvg, 180, 180, 'apple.png'), logo512 = png(appleSvg, 512, 512, 'logo512.png')
const sizes = [16, 32, 48], imgs = sizes.map(s => png(out['icon.svg'], s, s, `f${s}.png`))
const head = Buffer.alloc(6 + 16 * sizes.length)
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4)
let offset = head.length
sizes.forEach((s, i) => {
  const o = 6 + 16 * i
  head.writeUInt8(s, o); head.writeUInt8(s, o + 1); head.writeUInt8(0, o + 2); head.writeUInt8(0, o + 3)
  head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6)
  head.writeUInt32LE(imgs[i].length, o + 8); head.writeUInt32LE(offset, o + 12)
  offset += imgs[i].length
})
const ico = Buffer.concat([head, ...imgs])
writeFileSync(join(here, 'favicon.ico'), ico)
writeFileSync(join(here, 'apple-touch-icon.png'), apple)

// ── Install into the static site ───────────────────────────────────────────
if (install) {
  writeFileSync(join(root, 'favicon.svg'), out['icon.svg'])
  writeFileSync(join(root, 'favicon.ico'), ico)
  writeFileSync(join(root, 'apple-touch-icon.png'), apple)
  mkdirSync(join(root, 'brand'), { recursive: true })
  writeFileSync(join(root, 'brand/logo-512.png'), logo512)

  // Inline so it needs no request and inherits nothing. `zp-logo` marks our own
  // output (matched anywhere in the tag) so a rerun replaces it instead of nesting.
  const inline = (h, ink, coin) => wordmark(ink, coin, ` class="zp-logo" height="${h}" width="${Math.round(h * WORD_VB[2] / WORD_VB[3])}" style="display:block"`).trim()
  const NAV = inline(26, INK, ACCENT), FOOT = inline(26, '#fff', ACCENT_ON_DARK)
  const OURS = String.raw`<svg[^>]*\bclass="zp-logo"[\s\S]*?<\/svg>`
  const swaps = [
    // Nav and trial-page logos: any <a class="logo"> holding the "Z" tile (logo-mark or
    // logo-icon, div or span) and the name as text, or our own svg.
    [new RegExp(String.raw`(<a\b[^>]*\bclass="logo"[^>]*>)\s*(?:<(div|span) class="logo-(?:mark|icon)">Z<\/\2>\s*(?:<(span|div) class="logo-text">Zay(?:<span>POS<\/span>|POS)<\/\3>|ZayPOS)|${OURS})\s*(<\/a>)`, 'g'), `$1${NAV}$4`],
    // Footers on #1A1208: the tile and the name inside a flex wrapper.
    [new RegExp(String.raw`(<div style="display:flex;align-items:center;gap:10px;">)\s*(?:<div class="footer-logo-mark">Z<\/div>\s*<span class="footer-logo-text">Zay<span>POS<\/span><\/span>|${OURS})`, 'g'), `$1${FOOT}`],
    // profit-calculator.html's footer row, also on dark.
    [new RegExp(String.raw`(<div class="footer-brand-row">)\s*(?:<div class="logo-mark">Z<\/div>\s*<span>Zay<span>POS<\/span><\/span>|${OURS})`, 'g'), `$1${FOOT}`],
  ]
  const ICONS = '<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/apple-touch-icon.png">'
  const report = []
  for (const page of readdirSync(root).filter(n => n.endsWith('.html'))) {
    const p = join(root, page)
    let html = readFileSync(p, 'utf8'), n = 0
    for (const [re, to] of swaps) html = html.replace(re, (...m) => { n++; return to.replace('$1', m[1]).replace('$4', m[4] ?? '') })
    // Every icon link (and the newline after it) goes, then one set is added.
    html = html.replace(/[ \t]*<link rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>\n?/g, '').replace('</head>', `${ICONS}\n</head>`)
    html = html.replace(/("logo":\s*\{\s*"@type":\s*"ImageObject",\s*"url":\s*")[^"]*"/g, '$1https://www.zaypos.co.uk/brand/logo-512.png"')
    writeFileSync(p, html)
    report.push(`${page}: ${n} logo${n === 1 ? '' : 's'}`)
  }
  console.log(report.join('\n'))
}
console.log('built', Object.keys(out).length, 'svgs + favicon.ico, apple-touch-icon.png, logo@2x.png' + (install ? ', installed' : ''))
