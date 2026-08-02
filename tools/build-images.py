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
QUALITY = 80

# The ten West Elm pairs. NN.jpg is the finished composite; NN_Plate.jpg is the
# plate, and both are already identical in dimensions per pair — which is what
# lets the wipe land without any cropping or alignment work.
WEST_ELM = ["01", "02", "03", "04", "05", "08", "12", "14", "20", "21"]

# Nordson's Cordis pair. Both files carry the SAME machine — drawing left of
# centre, photograph right of it, cut at exactly half — and differ only in which
# side the pale ground falls on. That mirroring is not decoration: each layer of
# the reveal writes its copy into its own pale half, so the type always lands on
# the quiet side. Named for where the pale field is, because that is the thing
# that differs and the thing the layout depends on.
NORDSON = [("Cordis-Spread-1", "cordis-paper-left"),
           ("Cordis-Spread-2", "cordis-paper-right")]


def derive(src_path, out_path, exact=None):
    """Write one derivative. `exact` forces a size, used to make a pair match."""
    with Image.open(src_path) as im:
        im = im.convert("RGB")
        if exact:
            im = im.resize(exact, Image.LANCZOS)
        elif im.width > MAX_W:
            h = round(im.height * MAX_W / im.width)
            im = im.resize((MAX_W, h), Image.LANCZOS)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        im.save(out_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        return im.size, os.path.getsize(out_path)


def build_nordson():
    """The Cordis pair. Same forcing as West Elm: the first file sets the size and
    the second is made to match, because the reveal holds them exactly on top of
    each other and a pixel of drift would show as the machine twitching."""
    src_dir = os.path.join(SRC, "nordson")
    if not os.path.isdir(src_dir):
        print("\nno _source/nordson — skipping the Cordis pair")
        return

    out_dir = os.path.join(OUT, "nordson")
    print("\nNordson")
    size = None
    for src_name, out_name in NORDSON:
        src = os.path.join(src_dir, f"{src_name}.jpg")
        if not os.path.exists(src):
            print(f"  MISSING {src_name}.jpg")
            continue
        got, wrote = derive(src, os.path.join(out_dir, f"{out_name}.jpg"), exact=size)
        size = size or got
        print(f"  {out_name}.jpg  {got[0]}x{got[1]}  {wrote // 1024} KB")


def main():
    src_dir = os.path.join(SRC, "west-elm")
    if not os.path.isdir(src_dir):
        print("no _source/west-elm — skipping those pairs")
        return build_nordson()

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


if __name__ == "__main__":
    main()
