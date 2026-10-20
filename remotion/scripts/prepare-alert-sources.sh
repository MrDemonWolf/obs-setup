#!/usr/bin/env bash
set -euo pipefail

alert_dir="${ALERT_EXPORT_DIR:-$HOME/Library/CloudStorage/GoogleDrive-nathanial.henniges@mrdemonwolf.com/My Drive/MultiMedia Projects/Social Media/Twitch/Alerts/Exports}"
output_dir="public/alerts/source"
mkdir -p "$output_dir"

convert_alert() {
  local input="$1" output="$2"
  if [[ ! -f "$input" ]]; then
    echo "Missing alert master: $input" >&2
    exit 1
  fi
  mkdir -p "$output"
  find "$output" -type f -name '*.png' -delete
  ffmpeg -hide_banner -loglevel error -y -i "$input" \
    -an -vf 'fps=30,scale=480:270:flags=lanczos' -start_number 0 \
    "$output/%04d.png"
}

convert_alert "$alert_dir/Follow Alert.mov" "$output_dir/follow"
convert_alert "$alert_dir/Sub and Bit Alert.mov" "$output_dir/sub-bits"
convert_alert "$alert_dir/Gifted Sub Alert.mov" "$output_dir/gifted-sub"
echo "Prepared transparent 480×270 PNG frame sequences in $output_dir"
