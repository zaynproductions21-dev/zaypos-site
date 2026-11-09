# Outlines type for the concept lockups, so no file depends on a web font.
# Reads a JSON list of {id, font, wght, axes, text, size, tracking} on stdin and prints
# {id: {width, glyphs: [{char, x, adv, d, bbox}]}}; baseline at y=0, y pointing down.
# Shaped with HarfBuzz (kerning on), outlines from fontTools. tracking is in 1/1000 em.
# Run: <venv>/bin/python outline.py < spec.json   (pip install fonttools uharfbuzz)
import json, sys
from pathlib import Path
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONTS = Path(__file__).resolve().parent.parent / 'fonts'
out = {}
for spec in json.load(sys.stdin):
    path = FONTS / spec['font']
    blob = hb.Blob.from_file_path(str(path))
    face = hb.Face(blob)
    font = hb.Font(face)
    loc = dict(spec.get('axes', {}))
    if spec.get('wght'):
        loc['wght'] = spec['wght']
    if loc:
        font.set_variations(loc)
    buf = hb.Buffer()
    buf.add_str(spec['text'])
    buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': spec.get('liga', True)})
    tt = TTFont(str(path))
    gs = tt.getGlyphSet(location=loc or None)
    order = tt.getGlyphOrder()
    upem = tt['head'].unitsPerEm
    s = spec['size'] / upem
    track = spec.get('tracking', 0) * upem / 1000
    x, glyphs = 0.0, []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        pen = SVGPathPen(gs)
        gx = (x + pos.x_offset) * s
        bp = BoundsPen(gs)
        for p in (pen, bp):
            gs[name].draw(TransformPen(p, (s, 0, 0, -s, gx, -pos.y_offset * s)))
        adv = (pos.x_advance + track) * s
        glyphs.append({'char': spec['text'][info.cluster], 'x': round(gx, 2), 'adv': round(adv, 2), 'd': pen.getCommands(),
                       'bbox': [round(v, 2) for v in bp.bounds] if bp.bounds else None})
        x += pos.x_advance + track
    out[spec['id']] = {'width': round(x * s - track * s, 2), 'glyphs': glyphs}
json.dump(out, sys.stdout)
