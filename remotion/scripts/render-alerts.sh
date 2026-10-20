#!/usr/bin/env bash
set -euo pipefail

output_dir="out/alerts"
review_dir="public/alerts/review"
source_dir="public/alerts/source"
mkdir -p "$output_dir" "$review_dir"

for source in follow sub-bits gifted-sub; do
  if [[ ! -f "$source_dir/$source/0000.png" ]]; then
    echo "Missing $source_dir/$source/0000.png. Run npm run alerts:prepare first." >&2
    exit 1
  fi
done

render_alert() {
  local id="$1" slug="$2"
  npx remotion render "$id" "$output_dir/$slug.mov" \
    --codec=prores --prores-profile=4444 --image-format=png \
    --pixel-format=yuva444p10le --log=error
  ffmpeg -hide_banner -loglevel error -y -i "$output_dir/$slug.mov" \
    -filter_complex '[0:v]split[a][b];[a]palettegen=reserve_transparent=1[p];[b][p]paletteuse=alpha_threshold=128' \
    -loop -1 "$output_dir/$slug.gif"
  local size
  size=$(wc -c < "$output_dir/$slug.gif")
  if (( size > 25000000 )); then
    echo "$slug.gif exceeds Twitch's 25 MB image upload limit ($size bytes)" >&2
    exit 1
  fi
  cp "$output_dir/$slug.gif" "$review_dir/$slug.gif"
}

render_alert AlertFollow alert-follow
render_alert AlertSubscribe alert-subscription
render_alert AlertBits alert-bits
render_alert AlertGift alert-gifted-sub
echo "Rendered transparent GIFs and ProRes 4444 masters in $output_dir"
