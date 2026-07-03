import { execSync } from "node:child_process";

// Renders every scene into out/ with clear, numbered, kebab-case names.
// Composition ids (left) stay as defined in src/scenes.ts; only the output
// filename (right) is friendly. Keep this list in sync with src/scenes.ts.
const scenes = [
  { id: "StartingSoon", file: "01-starting-soon" },
  { id: "JustChatting", file: "02-just-chatting" },
  { id: "Streaming", file: "03-streaming" },
  { id: "Coworking", file: "04-co-working" },
  { id: "BRB", file: "05-be-right-back" },
  { id: "EndingStream", file: "06-ending-stream" },
  { id: "Background", file: "background" },
];

for (const s of scenes) {
  console.log(`\n▶ Rendering ${s.file}…`);
  execSync(`npx remotion render ${s.id} out/${s.file}.mp4 --log=error`, { stdio: "inherit" });
}

// Socials badge → transparent. ProRes 4444 .mov (best for OBS on Apple Silicon:
// hardware-decoded, clean alpha) + a GIF for convenience.
console.log("\n▶ Rendering socials-badge (mov + gif)…");
// --image-format=png + --pixel-format=yuva444p10le: global config pipes jpeg
// frames (no alpha channel), which silently flattens the transparency.
execSync("npx remotion render Socials out/socials-badge.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --log=error", { stdio: "inherit" });
execSync("npx remotion render Socials out/socials-badge.gif --codec=gif --log=error", { stdio: "inherit" });

// GIF copy of the plain Background (MP4 is lighter in OBS, but handy to have).
console.log("\n▶ Rendering background gif…");
execSync("npx remotion render Background out/background.gif --codec=gif --scale=0.5 --every-nth-frame=2 --log=error", { stdio: "inherit" });

console.log("\n✓ Done → remotion/out/");
