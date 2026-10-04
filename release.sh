#!/usr/bin/env bash
# Render every overlay, transcode the transparent ones to HEVC-alpha, regenerate
# the webcam masks, and package separate dated overlay and stinger ZIPs in
# ~/Downloads — ready to copy to Google Drive.
#
# Usage:
#   ./release.sh            # reuse the heavy Countdown/LoadingBarks ProRes
#                           # masters if they already exist (they rarely change)
#   ./release.sh --force    # re-render those two heavy overlays too
#   ./release.sh --package-only # package and validate the existing renders
#
# Needs: node_modules installed in remotion/ (npm install), ffmpeg (to-hevc.sh),
# and Pillow for mask regen (pip install pillow — optional; falls back to the
# committed masks if missing). Set OBS_RELEASE_OUTPUT_DIR to choose the output.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
R="$ROOT/remotion"
OUT="$R/out"
DATE="${OBS_RELEASE_DATE:-$(date +%F)}"
DOWNLOADS_DIR="${OBS_RELEASE_OUTPUT_DIR:-$HOME/Downloads}"
OVERLAY_NAME="OBS-overlays-$DATE"
STINGER_NAME="OBS-stinger-$DATE"
FORCE=""
PACKAGE_ONLY=0
case "${1:-}" in
  "") ;;
  --force) FORCE="--force" ;;
  --package-only) PACKAGE_ONLY=1 ;;
  *) echo "usage: $0 [--force|--package-only]" >&2; exit 2 ;;
esac

cd "$R"

if [ "$PACKAGE_ONLY" -eq 1 ]; then
  echo "▶ package existing Remotion renders…"
  required_outputs=(
    01-starting-soon.mp4 02-just-chatting.mp4 03-just-chatting-vtuber.mp4
    04-co-working-solo.mp4 05-co-working-dual.mp4 06-be-right-back.mp4
    07-ending-stream.mp4 background.mp4
    socials-badge.mov countdown.mov countdown-10m.mov loading-barks.mov stinger.mov
    socials-badge-hevc.mov countdown-hevc.mov countdown-10m-hevc.mov loading-barks-hevc.mov stinger-hevc.mov
  )
  for file in "${required_outputs[@]}"; do
    if [ ! -s "out/$file" ]; then
      echo "missing rendered file: out/$file (run ./release.sh first)" >&2
      exit 1
    fi
  done
else
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
prores Countdown10  countdown-10m.mov
prores LoadingBarks loading-barks.mov

# Stinger transition — short, so always render (no reuse gate). The SFX is baked
# in via <Audio>, so the ProRes master carries an audio track.
echo "▶ render Stinger (ProRes 4444)…"
npx remotion render Stinger out/stinger.mov --codec=prores --prores-profile=4444 \
  --image-format=png --pixel-format=yuva444p10le --log=error

# Stinger joins the HEVC-alpha transcode. WebM-alpha is the "ideal" portable
# stinger format, but Homebrew ffmpeg (local + the CI macOS runner) isn't built
# with libvpx alpha — VP8/VP9 silently drop the alpha channel. HEVC-alpha .mov
# keeps transparency, hardware-decodes on every Apple Silicon chip, and OBS on
# macOS reads it natively (both target Macs). See README note.
echo "▶ transcode transparent masters → HEVC-alpha (hvc1)…"
./to-hevc.sh out/socials-badge.mov out/countdown.mov out/countdown-10m.mov out/loading-barks.mov out/stinger.mov
fi

echo "▶ validate stinger timing and encoded streams…"
python3 "$ROOT/scripts/validate_stinger.py" \
  --rendered "$OUT/stinger.mov" --encoded "$OUT/stinger-hevc.mov" \
  --alpha-file "$OUT/socials-badge-hevc.mov" \
  --alpha-file "$OUT/countdown-hevc.mov" \
  --alpha-file "$OUT/countdown-10m-hevc.mov" \
  --alpha-file "$OUT/loading-barks-hevc.mov"

echo "▶ regenerate webcam masks…"
python3 "$ROOT/masks/gen_masks.py" \
  || echo "⚠ mask regen skipped (need: pip install pillow) — using committed masks"

# Keep the scene/overlay download independent from the separately encoded
# stinger. Build archives in a fresh temporary directory; only the two ZIPs go
# to the requested download folder.
WORK="$(mktemp -d "${TMPDIR:-/tmp}/obs-release-$DATE.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT
OVERLAY_DIR="$WORK/$OVERLAY_NAME"
STINGER_DIR="$WORK/$STINGER_NAME"
OVERLAY_ZIP="$WORK/$OVERLAY_NAME.zip"
STINGER_ZIP="$WORK/$STINGER_NAME.zip"

echo "▶ assemble separate overlay and stinger archives…"
mkdir -p "$OVERLAY_DIR/Overlays" "$OVERLAY_DIR/Masks" "$STINGER_DIR"
cp "$OUT"/0*.mp4 "$OUT"/background.mp4 \
   "$OUT"/socials-badge-hevc.mov "$OUT"/loading-barks-hevc.mov \
   "$OUT"/countdown-hevc.mov "$OUT"/countdown-10m-hevc.mov "$OVERLAY_DIR/Overlays/"
cp "$ROOT"/masks/*.png "$OVERLAY_DIR/Masks/"
cp "$OUT"/stinger-hevc.mov "$R"/public/stinger.wav "$STINGER_DIR/"

# Overlay package README — the scene transition has its own download.
{
  echo "# MrDemonWolf Stream Overlays — OBS bundle"
  echo
  echo "_Rendered $DATE. The Stinger transition is packaged separately._"
  echo
  cat <<'EOF'
This package contains the scene overlays and webcam masks.

```
Overlays/   12 videos — 8 full-frame MP4s + 4 transparent HEVC-alpha .mov
Masks/      rounded-corner webcam masks (PNG, alpha)
```

## Add each as a Media Source

1. Sources → **+** → **Media Source** → **Local File** → pick the file.
2. **Loop**: ON for everything **except the two countdown files** (play once, start on going live).
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
| `countdown-10m-hevc.mov` | 10:00 countdown | **OFF** — start on going live |

## Stinger transition

The Stinger is a separate download because it has its own HEVC-alpha video and
embedded audio. Download `OBS-stinger-<date>.zip` from the same release, then
follow the included setup README or [`docs/stinger-setup.md`](https://github.com/MrDemonWolf/obs-setup/blob/main/docs/stinger-setup.md).

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
} > "$OVERLAY_DIR/README.md"

# Self-contained transition setup. The WAV is the source used by Remotion;
# its sound is already baked into the video and must not be added twice in OBS.
cat > "$STINGER_DIR/README.md" <<'EOF'
# MrDemonWolf Stinger — OBS scene transition

This standalone transition package contains the encoded video, its original
source WAV, and the OBS settings needed to install it.

## Install in OBS

1. Copy `stinger-hevc.mov` somewhere permanent on this Mac.
2. In OBS, open **Scene Transitions** and select **+ → Stinger**.
3. Set **Video File** to `stinger-hevc.mov`.
4. Set **Transition Point Type** to **Time** and **Transition Point** to
   **2000 ms**. The scene changes while the screen is covered.
5. Set **Audio Fade Style** to **Crossfade**, then save.

The whoosh is already embedded in `stinger-hevc.mov`. Do not add `stinger.wav`
as another OBS audio source. It is included as the original audio source and
for future renders. The clip is 4 seconds at 60 fps and is encoded as HEVC
with alpha for OBS on macOS.
EOF

mkdir -p "$DOWNLOADS_DIR"
FINAL_OVERLAY_ZIP="$DOWNLOADS_DIR/$OVERLAY_NAME.zip"
FINAL_STINGER_ZIP="$DOWNLOADS_DIR/$STINGER_NAME.zip"
echo "▶ zip overlay bundle…"
( cd "$WORK" && zip -rq "$OVERLAY_ZIP" "$OVERLAY_NAME" )
echo "▶ zip stinger bundle…"
( cd "$WORK" && zip -rq "$STINGER_ZIP" "$STINGER_NAME" )

echo "▶ validate archive contents…"
python3 "$ROOT/scripts/validate_release_packages.py" \
  "$OVERLAY_ZIP" "$STINGER_ZIP" --masks-dir "$ROOT/masks"

mv -f "$OVERLAY_ZIP" "$FINAL_OVERLAY_ZIP"
mv -f "$STINGER_ZIP" "$FINAL_STINGER_ZIP"
echo "✓ overlay download → $FINAL_OVERLAY_ZIP"
echo "✓ stinger download → $FINAL_STINGER_ZIP"
