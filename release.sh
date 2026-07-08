#!/usr/bin/env bash
# Render every overlay, transcode the transparent ones to HEVC-alpha, regenerate
# the webcam masks, and package a dated OBS drop-in bundle (videos + masks +
# README) as a .zip in ~/Downloads — ready to copy to Google Drive.
#
# Usage:
#   ./release.sh            # reuse the heavy Countdown/LoadingBarks ProRes
#                           # masters if they already exist (they rarely change)
#   ./release.sh --force    # re-render those two heavy overlays too
#
# Needs: node_modules installed in remotion/ (npm install), ffmpeg (to-hevc.sh),
# and Pillow for mask regen (pip install pillow — optional; falls back to the
# committed masks if missing).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
R="$ROOT/remotion"
OUT="$R/out"
DATE="$(date +%F)"
BUNDLE="$HOME/Downloads/OBS-overlays-$DATE"
FORCE="${1:-}"

cd "$R"

echo "▶ render:all (8 opaque MP4s + socials + background)…"
npm run render:all

# Heavy transparent full-frame ProRes 4444 masters — multi-GB and slow, and they
# rarely change, so reuse an existing file unless --force.
# ponytail: existence check, not a content hash; --force when you edited them.
prores() { # <CompId> <outfile>
  if [ "$FORCE" = "--force" ] || [ ! -f "out/$2" ]; then
    echo "▶ render $1 (ProRes 4444, heavy)…"
    npx remotion render "$1" "out/$2" --codec=prores --prores-profile=4444 \
      --image-format=png --pixel-format=yuva444p10le --log=error
  else
    echo "• reuse out/$2 (exists — pass --force to re-render)"
  fi
}
prores Countdown    countdown.mov
prores LoadingBarks loading-barks.mov

echo "▶ transcode transparent masters → HEVC-alpha (hvc1)…"
./to-hevc.sh out/socials-badge.mov out/countdown.mov out/loading-barks.mov

echo "▶ regenerate webcam masks…"
python3 "$ROOT/masks/gen_masks.py" \
  || echo "⚠ mask regen skipped (need: pip install pillow) — using committed masks"

echo "▶ assemble bundle → $BUNDLE"
# Flat layout by request: ALL videos in one Overlays/ folder (no opaque/
# transparent split), masks in Masks/, README.md at the zip root. Nothing else.
VID="Overlays"   # top-level video folder name inside the bundle
MSK="Masks"      # top-level mask folder name inside the bundle
rm -rf "$BUNDLE"
mkdir -p "$BUNDLE/$VID" "$BUNDLE/$MSK"
cp "$OUT"/0*.mp4 "$OUT"/background.mp4 \
   "$OUT"/socials-badge-hevc.mov "$OUT"/loading-barks-hevc.mov \
   "$OUT"/countdown-hevc.mov "$BUNDLE/$VID/"
cp "$ROOT"/masks/*.png "$BUNDLE/$MSK/"

# README — quoted heredoc so markdown backticks stay literal; date prepended.
{
  echo "# MrDemonWolf Stream Overlays — OBS drop-in bundle"
  echo
  echo "_Rendered $DATE._"
  echo
  cat <<'EOF'
Everything OBS needs is in this folder.

```
Overlays/   11 videos — 8 full-frame MP4s + 3 transparent HEVC-alpha .mov
Masks/      5 rounded-corner webcam masks (PNG, alpha)
```

## Add each as a Media Source

1. Sources → **+** → **Media Source** → **Local File** → pick the file.
2. **Loop**: ON for everything **except `countdown-hevc.mov`** (plays once, start on going live).
3. Full-frame overlays sit at **0, 0** (they're 1920×1080). `socials-badge` is 760×180 — place it anywhere.

### Files → scene → loop

| File | Scene | Loop |
|---|---|---|
| `01-starting-soon.mp4` | Starting Soon | ON |
| `02-just-chatting.mp4` | Just Chatting | ON |
| `03-just-chatting-vtuber.mp4` | Just Chatting · VTuber | ON |
| `04-co-working-solo.mp4` | Co-Working · Solo | ON |
| `05-co-working-dual.mp4` | Co-Working · Dual | ON |
| `06-be-right-back.mp4` | Be Right Back | ON |
| `07-ending-stream.mp4` | Ending Stream | ON |
| `background.mp4` | Background (also plain gameplay) | ON |
| `socials-badge-hevc.mov` | Socials badge (over anything) | ON |
| `loading-barks-hevc.mov` | Loading overlay (over anything) | ON |
| `countdown-hevc.mov` | 5:00 countdown | **OFF** — start on going live |

## Webcam placement (Co-Working + Just Chatting)

The overlay draws the rounded cam frame; place your real cam/chat source
**inside** it, then clip the square corners with the matching mask.

Overlay source = full-frame 1920×1080 at **0,0**. Cam source Transform
(right-click → Transform → Edit Transform):

| Scene | Source | Position (x, y) | Size (w × h) | Mask |
|---|---|---|---|---|
| Co-Working · Solo | Cam | 64, 136 | 1400 × 788 | `co-working-solo.png` |
| Co-Working · Dual | Main cam | 64, 136 | 1152 × 648 | `co-working-dual-big.png` |
| Co-Working · Dual | 2nd cam | 1280, 628 | 576 × 324 | `co-working-dual-small.png` |
| Just Chatting | Cam | 64, 198 | 1216 × 684 | `just-chatting-cam.png` |
| Just Chatting | Chat | 1344, 198 | 512 × 684 | `just-chatting-chat.png` |
| Just Chatting · VTuber | Chat | 1344, 198 | 512 × 684 | `just-chatting-chat.png` |

VTuber = no cam frame (model fullscreen); chat frame is the same box.

### Apply a mask (rounds the cam corners)

1. Select the cam source → right-click → **Filters**.
2. Effect Filters → **+** → **Image Mask/Blend**.
3. Type = **Alpha Mask (Alpha Channel)**, Path = the matching PNG above.
EOF
} > "$BUNDLE/README.md"

echo "▶ zip…"
( cd "$HOME/Downloads" && rm -f "OBS-overlays-$DATE.zip" \
  && zip -rq "OBS-overlays-$DATE.zip" "OBS-overlays-$DATE" )

echo "✓ done → $HOME/Downloads/OBS-overlays-$DATE.zip"
echo "  (unzipped copy at $BUNDLE)"
