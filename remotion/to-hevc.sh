#!/usr/bin/env bash
# Transcode transparent ProRes 4444 .mov → HEVC-with-alpha (hvc1) via VideoToolbox.
#
# Why: Apple Silicon hardware-DECODES HEVC on EVERY chip (base M1/M2 included).
# The dedicated ProRes engine only exists on M1/M2 *Pro/Max/Ultra* — so a plain
# M1/M2 Mac Mini software-decodes ProRes 4444 and can stutter in OBS. HEVC-alpha
# keeps the transparency, hardware-decodes everywhere, and is a fraction of the
# ProRes size. Use these for the OBS media sources; keep the ProRes as master.
#
# Usage: ./to-hevc.sh out/countdown.mov out/loading-barks.mov out/socials-badge.mov
#   writes <name>-hevc.mov next to each input.
# ponytail: fixed 12M bitrate — plenty for a 1080p60 overlay; bump if you see blocking.
set -euo pipefail
for f in "$@"; do
  [ -f "$f" ] || { echo "skip (missing): $f" >&2; continue; }
  o="${f%.mov}-hevc.mov"
  ffmpeg -y -i "$f" -c:v hevc_videotoolbox -alpha_quality 0.9 -b:v 12M \
    -tag:v hvc1 "$o" -loglevel error
  echo "→ $o"
done
