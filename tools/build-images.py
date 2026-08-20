#!/usr/bin/env python3
"""Build web derivatives from _source/ into assets/.

_source/ holds full-resolution originals and is not tracked. This writes the
sized, compressed versions the site actually serves, and those are committed.
Re-runnable: it overwrites, so it is safe to run after adding source art.

    python3 tools/build-images.py

Why 1600px: the widest a figure gets is 1000 CSS px, and 1600 covers that at the
1.6x most laptop displays actually use. 2x would double the bytes to buy detail
almost nobody resolves.
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "_source")
OUT = os.path.join(ROOT, "assets")

MAX_W = 1600
COVER_H = 720     # Provincetown's shelf sizes by HEIGHT — see build_pbg()
QUALITY = 80

# The ten West Elm pairs. NN.jpg is the finished composite; NN_Plate.jpg is the
# plate, and both are already identical in dimensions per pair — which is what
# lets the wipe land without any cropping or alignment work.
WEST_ELM = ["01", "02", "03", "04", "05", "08", "12", "14", "20", "21"]

# Nordson's Cordis pair: the machine photographed, and the same machine drawn.
# Same framing, same scale, both 4000x2668 (1.4993, which is what .wipe--3x2
# wants). The photograph sets the size and the drawing is forced to match, so a
# pixel of drift can never show as the machine twitching mid-drag.
#
# This REPLACED an earlier pair (Cordis-Spread-1/2) in which each file already
# held half a drawing and half a photograph, cut at x=1000, differing only in
# which side the pale ground fell on. That art existed to give the .reveal an
# empty half to write into. The reveal is gone and so is the need: these two are
# whole pictures, so dragging to an end now yields a whole machine.
#
# REGISTRATION IS CHECKED, NOT ASSUMED — see _shift() below, which prints an
# offset after every build. They come off one PSD, but "same PSD" is not the
# same as "aligned": the first blueprint was very slightly out, and it was out
# in the document. A structural measurement caught it and was then talked out of
# by the reasonable-sounding argument that identical sources cannot disagree.
# They can. Trust the number.
#
# The number measures TRANSLATION only. A pure scale difference — the machine
# drawn fractionally larger — would not move the correlation peak, and that is
# closer to what the first one actually was. So a clean dx/dy is necessary and
# not sufficient; look at the seam while dragging as well.
#
# 2000px, not the file-wide 1600. The source is a deliberate 2x stamp and the
# column tops out near 1000 CSS px, so 2000 is true 2x where 1600 is 1.6x. It
# costs about 40 KB across the pair, which is worth it on the one piece whose
# whole subject is that two renderings of one object are interchangeable — any
# softness here reads as the drawing failing to keep up with the photograph.
NORDSON_W = 2000
NORDSON = [("Cordis-Photo", "cordis-photo"),
           ("Cordis-Blueprint", "cordis-blueprint"),
           ("Cordis-Illo", "cordis-illo")]

# Covers that WordPress padded, and the box that gets the artwork back. Only one
# so far: the members map was stored 1262x1920 inside a grey gradient, so it was
# the single cover on the shelf that did not bleed to its own edges. Cropped, it
# is 832x1920 — the same tall format as the summer guide, which is the giveaway
# that the padding was the CMS and not the design.
#
# Detected once, then written down. An automatic version was tried first and is
# NOT worth reviving: it looks for uniform neutral edges, and the Pride poster
# ends in a white sponsor strip, so it wanted to cut 56px of real artwork off the
# bottom. White is neutral. Measure a cover, put the numbers here.
COVER_CROP = {
    "2019-map.jpg": (216, 0, 1048, 1920),
}

# Covers whose "full" artifact is the image itself rather than a PDF. The Pride
# poster is a poster — there are no pages to turn — so it gets a full-size
# derivative in assets/pbg/full/ alongside the seven publications' PDFs, and the
# shelf links every tile to something rather than leaving one dead.
COVER_FULL = ["2020-pride.jpg"]


def derive(src_path, out_path, exact=None, max_w=None, max_h=None, crop=None):
    """Write one derivative. `exact` forces a size, used to make a pair match.
    `max_w` overrides the default cap for art that never renders full width.
    `max_h` sizes by HEIGHT instead — for art laid out on a common baseline.
    `crop` is a box applied before resizing — see COVER_CROP."""
    cap = max_w or MAX_W
    with Image.open(src_path) as im:
        im = im.convert("RGB")
        if crop:
            im = im.crop(crop)
        if exact:
            im = im.resize(exact, Image.LANCZOS)
        elif max_h:
            w = round(im.width * max_h / im.height)
            im = im.resize((w, max_h), Image.LANCZOS)
        elif im.width > cap:
            h = round(im.height * cap / im.width)
            im = im.resize((cap, h), Image.LANCZOS)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        im.save(out_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        return im.size, os.path.getsize(out_path)


def _shift(path_a, path_b, width=600, limit=24):
    """Offset between two renderings of the same subject, in source pixels.

    Pixels, not heuristics: both files come off one document, so any shared
    structure sits at the same coordinates. Reduce each to two 1-D profiles of
    gradient magnitude — one per axis — and cross-correlate. The peak is the
    offset. No thresholds, so nothing to tune and nothing to argue with; the
    two grounds being wholly different colours does not matter, because only
    the CHANGES in each image are compared, never the values.
    """
    def profiles(path):
        with Image.open(path) as im:
            im = im.convert("L")
            h = round(im.height * width / im.width)
            im = im.resize((width, h))
            px = im.load()
        cols = [0.0] * width
        rows = [0.0] * h
        for y in range(h):
            prev = px[0, y]
            for x in range(1, width):
                v = px[x, y]
                d = abs(v - prev)
                prev = v
                cols[x] += d
                rows[y] += d
        return cols, rows

    def peak(a, b):
        def norm(p):
            m = sum(p) / len(p)
            s = (sum((v - m) ** 2 for v in p) / len(p)) ** 0.5 or 1.0
            return [(v - m) / s for v in p]
        a, b = norm(a), norm(b)
        best, score = 0, -1e18
        for s in range(-limit, limit + 1):
            tot = cnt = 0
            for i in range(len(a)):
                j = i + s
                if 0 <= j < len(b):
                    tot += a[i] * b[j]
                    cnt += 1
            if cnt and tot / cnt > score:
                best, score = s, tot / cnt
        return best

    ac, ar = profiles(path_a)
    bc, br = profiles(path_b)
    with Image.open(path_a) as im:
        scale = im.width / width
    return round(peak(ac, bc) * scale), round(peak(ar, br) * scale)


def build_nordson():
    """The Cordis pair. Same forcing as West Elm: the first file sets the size and
    the second is made to match, because the wipe holds them exactly on top of
    each other and a pixel of drift would show as the machine twitching."""
    src_dir = os.path.join(SRC, "nordson")
    if not os.path.isdir(src_dir):
        print("\nno _source/nordson — skipping the Cordis pair")
        return

    out_dir = os.path.join(OUT, "nordson")
    print("\nNordson")
    size = None
    reference = None
    for src_name, out_name in NORDSON:
        src = os.path.join(src_dir, f"{src_name}.jpg")
        if not os.path.exists(src):
            print(f"  MISSING {src_name}.jpg")
            continue
        got, wrote = derive(src, os.path.join(out_dir, f"{out_name}.jpg"),
                            exact=size, max_w=NORDSON_W)
        size = size or got
        print(f"  {out_name}.jpg  {got[0]}x{got[1]}  {wrote // 1024} KB")
        # printed AFTER its own filename, or each result reads as belonging to
        # the file above it — which is exactly how it was misread once already
        if reference is None:
            reference = src
        else:
            dx, dy = _shift(reference, src)
            flag = "" if abs(dx) <= 4 and abs(dy) <= 4 else "   ** OUT OF REGISTER **"
            print(f"      registration vs {os.path.basename(reference)}: "
                  f"dx {dx:+d}  dy {dy:+d}{flag}")


def build_showdesk():
    """ShowDesk's Show Builder, one still.

    The five Ascend interface shots in assets/ are committed as full-size PNGs —
    15 MB between them — because they predate this tool. This one does not: the
    source is a 4480x2520 retina capture at 3.1 MB and the served derivative is
    about 125 KB, indistinguishable at the size it renders. Checked by zooming
    the clip list 2x: no artefacts on UI text at 1600/q80. The five legacy PNGs
    should come through here too, eventually."""
    src = os.path.join(SRC, "showdesk", "builder.png")
    if not os.path.exists(src):
        print("\nno _source/showdesk/builder.png — skipping the Show Builder shot")
        return
    print("\nShowDesk")
    size, wrote = derive(src, os.path.join(OUT, "showdesk", "builder.jpg"))
    print(f"  builder.jpg  {size[0]}x{size[1]}  {wrote // 1024} KB")


def build_wlvx():
    """WLVX's marketing cover — the only asset for that piece.

    CROPPED TO THE DEVICES, and that is the whole of the edit. The source is a
    2021 keynote cover: a gradient wordmark, the tagline "A Versatile Website
    Plugin for Video Content Creators", two devices floating on a teal ground.
    Everything that made it read as a pitch deck for a company that no longer
    exists sits OUTSIDE the devices; everything that is the work sits inside
    them. So the crop keeps the tablet, the phone and the hand, and drops the
    rest — the video playing, the tray of shoppable things beneath it, a finger
    on one, and the product page that touch produces.

    Cropped, not retouched. Retouching the on-screen text would mean inventing
    pixels; a crop only chooses which part was ever the product. 3:2 out, which
    matches the figures elsewhere on the page. The deck it came from is
    fundraising material and is deliberately NOT a source.

    ⚠ The original lives on /Volumes/2021, which unmounted mid-copy on
    18 Aug 2026 — the same failure mode as /Volumes/Today, on a second drive.
    This source is the 1999x1499 copy Jacob sent rather than the 3 MB original.
    Ample for a 1600px derivative; re-supply if a larger one is ever wanted."""
    src = os.path.join(SRC, "wlvx", "cover.png")
    if not os.path.exists(src):
        print("\nno _source/wlvx/cover.png — skipping the WLVX cover")
        return
    print("\nWLVX")
    with Image.open(src) as probe:
        w, h = probe.size
    # fractions, not pixels, so a larger re-supplied original crops the same
    box = (round(w * 0.115), round(h * 0.327), round(w * 0.875), h)
    size, wrote = derive(src, os.path.join(OUT, "wlvx", "cover.jpg"), crop=box)
    print(f"  cover.jpg  {size[0]}x{size[1]}  {wrote // 1024} KB")


def build_pbg():
    """Provincetown's shelf: one cover per publication, not a pair in sight.

    Sized to a common HEIGHT, not a common width, and that is the whole layout
    decision. Six of the eight are 2:3 and two are not — the 2019 summer guide
    is a genuine 288x720pt rack card, confirmed against its own PDF. Sized to a
    common width, those two tower over the rest and read as two mistakes rather
    than as two different formats. Sized to a common height they read as what
    they are: a narrow one and a wide one on the same shelf.

    720px tall, not 1600 wide: a cover renders around 300 CSS px tall at the
    largest the shelf gets, so 720 is the same 2x reasoning the top of this file
    applies to figures."""
    src_dir = os.path.join(SRC, "pbg", "covers")
    if not os.path.isdir(src_dir):
        print("\nno _source/pbg/covers — skipping the Provincetown shelf")
        return

    out_dir = os.path.join(OUT, "pbg")
    print("\nProvincetown")
    total_in = total_out = 0
    for name in sorted(os.listdir(src_dir)):
        if not name.lower().endswith(".jpg"):
            continue
        src = os.path.join(src_dir, name)
        total_in += os.path.getsize(src)
        crop = COVER_CROP.get(name)
        size, wrote = derive(src, os.path.join(out_dir, name),
                             max_h=COVER_H, crop=crop)
        total_out += wrote
        note = "   cropped, see COVER_CROP" if crop else ""
        print(f"  {name:22} {size[0]}x{size[1]}  {wrote // 1024} KB{note}")

        if name in COVER_FULL:
            fsize, fwrote = derive(src, os.path.join(out_dir, "full", name),
                                   crop=crop)
            total_out += fwrote
            print(f"  {'  └ full/' + name:22} {fsize[0]}x{fsize[1]}  {fwrote // 1024} KB")
    print(f"  {total_in // 1024 // 1024} MB source -> {total_out // 1024} KB served")


def main():
    src_dir = os.path.join(SRC, "west-elm")
    if not os.path.isdir(src_dir):
        print("no _source/west-elm — skipping those pairs")
        build_nordson()
        build_showdesk()
        build_wlvx()
        return build_pbg()

    out_dir = os.path.join(OUT, "west-elm")
    total_in = total_out = 0
    dims = {}

    for pair in WEST_ELM:
        # The composite sets the size; the plate is then forced to match it, so a
        # pair can never end up a pixel apart. Some sources differ by 1px, which
        # rounding would otherwise carry through into the wipe.
        comp_src = os.path.join(src_dir, f"{pair}.jpg")
        plate_src = os.path.join(src_dir, f"{pair}_Plate.jpg")
        if not (os.path.exists(comp_src) and os.path.exists(plate_src)):
            print(f"  MISSING one or both of pair {pair}")
            continue

        total_in += os.path.getsize(comp_src) + os.path.getsize(plate_src)

        size, wrote = derive(comp_src, os.path.join(out_dir, f"{pair}-composite.jpg"))
        total_out += wrote
        print(f"  {pair}-composite.jpg  {size[0]}x{size[1]}  {wrote // 1024} KB")

        psize, pwrote = derive(plate_src, os.path.join(out_dir, f"{pair}-plate.jpg"), exact=size)
        total_out += pwrote
        print(f"  {pair}-plate.jpg      {psize[0]}x{psize[1]}  {pwrote // 1024} KB")

        dims[pair] = (size, psize)

    print(f"\n{total_in // 1024 // 1024} MB source -> {total_out // 1024} KB served")

    mismatched = [p for p, (a, b) in dims.items() if a != b]
    print("all pairs registered" if not mismatched else f"MISMATCHED: {mismatched}")

    build_nordson()
    build_showdesk()
    build_wlvx()
    build_pbg()


if __name__ == "__main__":
    main()
