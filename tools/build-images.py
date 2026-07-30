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


def main():
    src_dir = os.path.join(SRC, "west-elm")
    if not os.path.isdir(src_dir):
        sys.exit("no _source/west-elm — nothing to build")

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


if __name__ == "__main__":
    main()
