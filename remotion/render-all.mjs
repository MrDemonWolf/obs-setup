import { execSync } from "node:child_process";

// Leave room for OBS and the preview browser during local exports.
const concurrency = process.env.OBS_RENDER_CONCURRENCY ?? "2";
if (!/^[1-9]\d*$/.test(concurrency)) throw new Error("OBS_RENDER_CONCURRENCY must be a positive integer");
const workers = `--concurrency=${concurrency}`;

// Renders every scene into out/ with clear, numbered, kebab-case names.
// Composition ids (left) stay as defined in src/scenes.ts; only the output
// filename (right) is friendly. Keep this list in sync with src/scenes.ts.
const scenes = [
  { id: "StartingSoon", file: "01-starting-soon" },
  { id: "JustChatting", file: "02-just-chatting" },
  { id: "JustChattingVtuber", file: "03-just-chatting-vtuber" },
  { id: "CoworkingSolo", file: "04-co-working-solo" },
  { id: "CoworkingDual", file: "05-co-working-dual" },
  { id: "BRB", file: "06-be-right-back" },
  { id: "EndingStream", file: "07-ending-stream" },
  { id: "Background", file: "background" },
  { id: "CoffeeBackground", file: "coffee-background" },
  { id: "CabinBackground", file: "cabin-background" },
];

// HQ + OBS-optimized H.264:
//  --image-format=png      lossless intermediates (default JPEG crushes dark gradients before encode)
//  --crf=15                near-transparent quality; dark navy gradients band at higher CRF
//  --x264-preset=veryslow  best compression at that quality (still fast for 240 frames)
//  --color-space=bt709     tag correctly so OBS doesn't shift colors (default mistags as bt470bg full-range)
//  --muted                 no silent audio track — smaller file, no ghost audio source in OBS
const MP4_FLAGS = `--image-format=png --crf=15 --x264-preset=veryslow --color-space=bt709 --muted --log=error ${workers}`;

for (const s of scenes) {
  console.log(`\n▶ Rendering ${s.file}…`);
  execSync(`npx remotion render ${s.id} out/${s.file}.mp4 ${MP4_FLAGS}`, { stdio: "inherit" });
}

// Socials badge → transparent. ProRes 4444 .mov (best for OBS on Apple Silicon:
// hardware-decoded, clean alpha) + a GIF for convenience.
console.log("\n▶ Rendering socials-badge (mov + gif)…");
// --image-format=png + --pixel-format=yuva444p10le: global config pipes jpeg
// frames (no alpha channel), which silently flattens the transparency.
execSync(`npx remotion render Socials out/socials-badge.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --log=error ${workers}`, { stdio: "inherit" });
execSync(`npx remotion render Socials out/socials-badge.gif --codec=gif --log=error ${workers}`, { stdio: "inherit" });

console.log("\n▶ Rendering transparent desk + coffee…");
execSync(`npx remotion render DeskForeground out/desk-foreground.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --muted --log=error ${workers}`, { stdio: "inherit" });

// NOTE: Countdown (5 + 10 min) + LoadingBarks (~4.7 min) are transparent
// panel-sized ProRes 4444 outputs; they remain heavy and slow. Kept OUT of this
// batch; render on demand:
//   npx remotion render LoadingBarks out/loading-barks.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --log=error
//   npx remotion render Countdown    out/countdown.mov     --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --log=error
//   npx remotion render Countdown10 out/countdown-10m.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --log=error

// GIF copy of the plain Background (MP4 is lighter in OBS, but handy to have).
console.log("\n▶ Rendering background gif…");
execSync(`npx remotion render Background out/background.gif --codec=gif --scale=0.5 --every-nth-frame=2 --log=error ${workers}`, { stdio: "inherit" });

console.log("\n✓ Done → remotion/out/");
