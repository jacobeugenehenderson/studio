#!/usr/bin/env python3
"""
Build the share card — assets/og-card.png, 1200x630.

The card is the masthead, not a picture of the masthead: four plates of the
name, cyan / magenta / yellow / registration black, composed by MULTIPLY the
way the sheet composes them. The three colour plates stop just short of true,
so a fringe survives at the edges — a press never registers perfectly and the
residual is the point (README section 4).

Values come from css/tokens.css and are read from it at build time rather than
copied here, so the card cannot drift from the palette. Rule 1 of the project
is that no colour lives outside that file, and a generator that hardcoded them
would be a second place a colour is defined.

    python3 tools/build-og.py

Re-run after changing the palette or the billing line. The output is committed;
it is served, so it belongs in assets/ like every other derivative.
"""

import re
import pathlib
from PIL import Image, ImageDraw, ImageFont, ImageChops

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOKENS = ROOT / "css" / "tokens.css"
OUT = ROOT / "assets" / "og-card.png"

W, H = 1200, 630
MARGIN = 76

DISPLAY = "/System/Library/Fonts/HelveticaNeue.ttc"
DISPLAY_BOLD = 1                       # index, see the .ttc's face table
MONO = "/System/Library/Fonts/SFNSMono.ttf"

# The plates, and how far each sits off true. Black is the register; the other
# three are pulled in but not all the way home.
PLATES = [
    ("--process-c", (-5, -3)),
    ("--process-m", (4, -2)),
    ("--process-y", (-2, 4)),
    ("--ink", (0, 0)),
]

LINE_1, LINE_2 = "JACOB", "HENDERSON"
PRACTICE = "CREATIVE OPERATIONS"
LEVEL = "CREATIVE DIRECTOR"
DOMAIN = "JACOBHENDERSON.STUDIO"


def light_tokens():
    """Every token declared in the :root block — the sheet, not the plate.

    Stops at the first closing brace so the dark-theme block below it cannot
    overwrite a value: both blocks declare the same names, and reading the
    whole file would silently hand back the plate's palette.
    """
    css = re.sub(r"/\*.*?\*/", "", TOKENS.read_text(), flags=re.S)
    root = css.split(":root", 1)[1].split("}", 1)[0]
    return dict(re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", root))


def rgb(value):
    v = value.strip().lstrip("#")
    return tuple(int(v[i:i + 2], 16) for i in (0, 2, 4))


def fit(text, target_width, path, index=None, start=200):
    """Largest size at which text fits target_width."""
    size = start
    while size > 24:
        font = (ImageFont.truetype(path, size, index=index) if index is not None
                else ImageFont.truetype(path, size))
        if font.getbbox(text)[2] <= target_width:
            return font
        size -= 2
    raise SystemExit("could not fit " + text)


def main():
    tok = light_tokens()
    paper, ink, faint, rule = (rgb(tok[k]) for k in
                               ("--paper", "--ink", "--ink-faint", "--rule-firm"))

    inner = W - MARGIN * 2
    name_font = fit(LINE_2, inner, DISPLAY, DISPLAY_BOLD)
    ascent = name_font.getbbox(LINE_2)
    line_h = int((ascent[3] - ascent[1]) * 1.06)
    top = MARGIN + 34

    # One layer per plate, each white where there is no ink, then multiplied
    # together. Multiply is what makes overlaps darken the way wet ink does;
    # compositing them with alpha would average toward grey instead.
    sheet = Image.new("RGB", (W, H), (255, 255, 255))
    for token, (dx, dy) in PLATES:
        layer = Image.new("RGB", (W, H), (255, 255, 255))
        d = ImageDraw.Draw(layer)
        colour = rgb(tok[token])
        d.text((MARGIN + dx, top + dy), LINE_1, font=name_font,
               fill=colour, anchor="lt")
        d.text((MARGIN + dx, top + line_h + dy), LINE_2, font=name_font,
               fill=colour, anchor="lt")
        sheet = ImageChops.multiply(sheet, layer)

    # Lay the composed plates onto the stock. The plates were built on white so
    # multiply behaves; the sheet is warm, so it goes underneath at the end.
    card = Image.new("RGB", (W, H), paper)
    card = ImageChops.multiply(card, sheet)

    d = ImageDraw.Draw(card)
    baseline = top + line_h * 2 + 46
    d.rectangle([MARGIN, baseline, W - MARGIN, baseline + 2], fill=ink)

    practice = ImageFont.truetype(MONO, 30)
    small = ImageFont.truetype(MONO, 22)
    y = baseline + 28
    d.text((MARGIN, y), PRACTICE, font=practice, fill=ink, anchor="lt")
    d.text((MARGIN + practice.getbbox(PRACTICE)[2] + 28, y + 7), LEVEL,
           font=small, fill=faint, anchor="lt")
    d.text((MARGIN, H - MARGIN + 10), DOMAIN, font=small, fill=faint, anchor="ls")

    # Corner registration marks, the same device the page carries.
    for cx, cy in ((MARGIN // 2, MARGIN // 2), (W - MARGIN // 2, MARGIN // 2),
                   (MARGIN // 2, H - MARGIN // 2), (W - MARGIN // 2, H - MARGIN // 2)):
        d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], outline=rule, width=2)
        d.line([cx - 15, cy, cx + 15, cy], fill=rule, width=2)
        d.line([cx, cy - 15, cx, cy + 15], fill=rule, width=2)

    card.save(OUT, optimize=True)
    print(f"{OUT.relative_to(ROOT)}  {W}x{H}  {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
