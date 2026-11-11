#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
output=${1:-"$HOME/Downloads/mrdemonwolf-moblin-scenes.zip"}
[ ! -e "$output" ] || { echo "Output exists: $output" >&2; exit 1; }
work=$(mktemp -d "${TMPDIR:-/tmp}/moblin-pack.XXXXXX")
trap 'rm -rf "$work"' EXIT HUP INT TERM
mkdir "$work/moblin-scenes"
cd "$root/remotion"
render() {
  id=$1 name=$2 props=$3
  npx remotion still src/index.ts "$id" "$work/moblin-scenes/$name.png" --frame=120 --props="$props" --log=error
}
render StartingSoon 01-starting-soon '{"title":"The Den Opens Soon","titleLines":["The Den","Opens Soon"],"subtitle":"Grab a drink. The pack will be live shortly.","showMascot":false,"showChatBox":true,"holdTitle":true}'
render BRB 06-be-right-back '{"title":"A Moment Off the Trail","titleLines":["A Moment","Off the Trail"],"subtitle":"Stretch your paws. I’ll be right back.","showMascot":false,"showChatBox":true,"holdTitle":true}'
render EndingStream 07-ending-stream '{"title":"Until the Next Howl","titleLines":["Until the","Next Howl"],"subtitle":"Thanks for spending time with the pack.","showMascot":false,"showChatBox":false,"holdTitle":true}'
npx remotion still src/index.ts JustChatting "$work/moblin-scenes/02-just-chatting.png" --frame=120 --log=error
npx remotion still src/index.ts CoworkingSolo "$work/moblin-scenes/04-co-working-solo.png" --frame=120 --log=error
backgrounds=${MOBLIN_BACKGROUND_DIR:-"$HOME/Library/CloudStorage/GoogleDrive-nathanial.henniges@mrdemonwolf.com/My Drive/MultiMedia Projects/Social Media/Twitch/Backgrounds"}
command -v ffmpeg >/dev/null
for background in background cabin-background coffee-background; do
  [ -f "$backgrounds/$background.mp4" ] || { echo "Missing background: $backgrounds/$background.mp4" >&2; exit 1; }
  ffmpeg -v error -ss 4 -i "$backgrounds/$background.mp4" -frames:v 1 "$work/moblin-scenes/03-live-$background.png"
done
cat > "$work/moblin-scenes/read-me.txt" <<'NOTE'
MRDEMONWOLF MOBLIN SCENE PACK

Starting Soon, Just Chatting, Co-working Solo, BRB and Ending have numbered PNG stills. Live has three numbered background choices taken from the OBS background videos. Number 05 is reserved for the OBS dual co-working layout, which is not in this pack. Starting Soon and BRB include a chat frame; add a separate Moblin chat widget over it if your setup supports positioning. These are media files, not importable Moblin settings.

Live: use the camera as the primary source, with the plain Live background where your setup supports it. Just Chatting: place camera and optional chat over the left and right frames. Co-working Solo: place a camera or available capture source over the large frame. Exact layering and sizing depend on your Moblin version; test on the iPad.

Test framing and audio on your iPad before going live. Mute the microphone during BRB if needed.
NOTE
(cd "$work" && zip -qr "$output" moblin-scenes)
unzip -t "$output" | tail -1
printf 'Created %s\n' "$output"
