#!/usr/bin/env python3
"""Generate OBS webcam masks matching the animated CamFrame overlays.

Each overlay video (remotion/) draws a rounded cerulean cam frame with a
transparent centre. A live OBS cam source placed inside that frame has SQUARE
corners and pokes past the rounding. These masks fix that: apply one to the cam
source via an "Image Mask/Blend" filter (Alpha Mask · Alpha Channel) and the cam
is clipped to the exact same rounded rectangle as the frame.

The geometry here MUST stay in sync with the frame coordinates in
remotion/src/CoworkFrame.tsx (COWORK_LAYOUTS) and JustChattingScene.tsx, and the
corner radius with `radius.card` in remotion/src/theme.ts. Re-run after changing
any of those:  python3 obs-masks/gen_masks.py

No app, no deps beyond Pillow (`pip install pillow`).
"""
from pathlib import Path
from PIL import Image, ImageDraw

RADIUS = 30  # remotion/src/theme.ts radius.card — the CamFrame corner radius

# name -> (width, height, overlay, canvas x, y of the frame's top-left)
# x/y are where the frame sits in the 1920x1080 scene, so you can position the
# cam source to match. See README.md.
MASKS = {
    "just-chatting-cam":       (1216, 684, "Just Chatting",            64,  198),
    "just-chatting-chat":      (512,  684, "Just Chatting / VTuber",  1344, 198),
    "co-working-solo":         (1152, 648, "Co-Working Solo",           64,  40),
    "co-working-dual-big":     (1152, 648, "Co-Working Dual (big)",     64,  40),
    "co-working-dual-small":   (576,  324, "Co-Working Dual (small)", 1280, 364),
}

OUT = Path(__file__).parent


def make(name: str, w: int, h: int) -> None:
    # RGBA, fully transparent; white opaque rounded rect = the visible cam area.
    # OBS "Alpha Mask (Alpha Channel)" keeps the cam where the mask is opaque.
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle([0, 0, w - 1, h - 1], radius=RADIUS, fill=(255, 255, 255, 255))
    img.save(OUT / f"{name}.png")


def main() -> None:
    for name, (w, h, overlay, x, y) in MASKS.items():
        make(name, w, h)
        print(f"  {name}.png  {w}x{h}  @({x},{y})  → {overlay}")
    # self-check: every mask has transparent corners and an opaque centre
    for name, (w, h, *_ ) in MASKS.items():
        im = Image.open(OUT / f"{name}.png").convert("RGBA")
        assert im.getpixel((0, 0))[3] == 0, f"{name}: corner not transparent"
        assert im.getpixel((w // 2, h // 2))[3] == 255, f"{name}: centre not opaque"
    print("selfcheck OK — corners transparent, centres opaque")


if __name__ == "__main__":
    main()
