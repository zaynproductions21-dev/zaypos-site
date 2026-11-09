# ZayPOS logo: usage

**Wordmark:** `logo.svg`, lowercase `zaypos` in outlined Inter Tight ExtraBold, set exactly like ZaynBot's so the ZaynIT products read as one family. The `o` is a solid violet coin: the till's pay button. Use it wherever the name appears: the nav, the footer, receipts, emails, invoices.
**Mark:** `mark.svg`, the coin on its own with the z cut out of it. Use it for the favicon, app icon, social avatar and the receipt-printer logo. Don't put it next to the wordmark; the wordmark already has the coin.

The type is Inter Tight (SIL Open Font License, `../fonts/OFL-InterTight.txt`), outlined so no file needs the font. Family rule: every ZaynIT product uses this setting, and only its `o` changes (ZaynBot's is an eye, ZayPOS's is a coin).

## Colour
| Ground | Letters | Coin | z in the mark |
|---|---|---|---|
| Light (cream `#FDFAF6`, white) | ink `#1A1208` | violet `#5B3EF5` | white |
| Dark (`#1A1208`) | `#ffffff` | light violet `#A78BFA` | ink `#1A1208` |
| Thermal receipt, photo, one-colour print | all `#000` or all `#fff` (the mono files; the z is a true hole) | | |

The coin is the only colour in the wordmark: never colour other letters (the old violet "POS" is retired), never use a gradient or a tile.

## Size and space
- Wordmark minimum: **18px tall** on screen, **18mm wide** in print. The site nav and footers use 26px.
- Mark minimum: **16px**.
- Clear space on every side: the diameter of the coin.

## Don't
- Capitalise it ("ZayPOS" stays the name in text; the logo is lowercase), retype it, or set it in another font.
- Turn the coin back into a ring, add a £ or a highlight to it, or put the mark in a tile.
- Stretch it, add letter-spacing, or outline it.
- Hand-edit the SVG paths or the page markup: change `build.mjs` and run `LOGO_PY=<venv>/bin/python node brand/logo/final/build.mjs --install`.

## Files
`logo.svg`, `logo-reversed.svg`, `logo-mono-black.svg`, `logo-mono-white.svg`, `logo@2x.png`, `mark.svg`, `mark-reversed.svg`, `mark-mono.svg`, `mark-mono-white.svg`, `icon.svg`, `favicon.ico` (16/32/48), `apple-touch-icon.png`, `geometry.json` (the outlined type, so the build runs without fonttools).

Written into the site by `--install`: the inline wordmark in every page's nav and dark footer (the trial page's centred logo too), one favicon link set per page (replacing the old inline base64 "Z" tiles), `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `brand/logo-512.png`, and the schema.org publisher logo URL on the news pages.
