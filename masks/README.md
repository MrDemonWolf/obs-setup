# OBS webcam masks

Rounded-corner masks that make a live OBS cam source match the animated cam
frames in the `remotion/` overlays. Without a mask the cam is a hard-edged
rectangle poking past the frame's rounded cerulean border; with one it's clipped
to the exact same `30px` rounded rectangle.

## The masks

Each PNG is a white rounded rectangle (radius `30`) on a transparent background,
sized to its cam box. `@(x,y)` is where that frame sits in the 1920×1080 scene —
position the cam source there at the given size and the mask lines up 1:1.

| File | Overlay | Cam size | Position `@(x,y)` |
|---|---|---|---|
| `just-chatting-cam.png` | Just Chatting | 1216 × 684 | (64, 198) |
| `just-chatting-chat.png` | Just Chatting **and** VTuber (chat) | 512 × 684 | (1344, 198) |
| `co-working-solo.png` | Co-Working Solo | 1400 × 788 | (64, 136) |
| `co-working-dual-big.png` | Co-Working Dual — big cam | 1152 × 648 | (64, 136) |
| `co-working-dual-small.png` | Co-Working Dual — small cam | 576 × 324 | (1280, 628) |

Notes:
- **VTuber** (`JustChattingVtuber`) uses only the chat frame — reuse
  `just-chatting-chat.png`; the model itself goes full-screen, unmasked.
- `Background` and the card scenes (Starting Soon / BRB / Ending) have **no**
  cam frame, so no mask.

## Apply one in OBS

1. Add your camera as a source (Video Capture Device) in the scene.
2. Size/position it to the cam box above — the exact `@(x,y)` and size — so it
   sits under the frame. (Hold a modifier while dragging to snap, or type the
   Transform values via *Edit → Transform → Edit Transform*.)
3. Right-click the cam source → **Filters**.
4. Under *Effect Filters*, click **+** → **Image Mask/Blend**.
5. Set **Type** = **Alpha Mask (Alpha Channel)**.
6. **Path** → browse to the matching `*.png` here. Done — corners are rounded.

The overlay video (with the glowing border) goes **above** the cam source in the
scene list, so the border frames the masked cam.

### Why this works
OBS's *Alpha Mask (Alpha Channel)* keeps the source wherever the mask is opaque
and hides it wherever the mask is transparent. The mask is stretched to the cam
source's bounding box, so as long as the cam is sized to the box (matching aspect
ratio) the `30px` corner radius lands exactly. If you scale the cam differently
the corners still round — just proportionally.

## Regenerating

The masks are generated from the same geometry as the overlays. If you change a
cam frame's size/position in `remotion/src/CoworkFrame.tsx` or
`JustChattingScene.tsx`, or the corner radius in `remotion/src/theme.ts`, re-run:

```bash
python3 masks/gen_masks.py   # needs Pillow: pip install pillow
```

It rewrites all five PNGs and self-checks that corners are transparent and
centres opaque.
