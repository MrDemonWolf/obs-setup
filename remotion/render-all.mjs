import { execSync } from "node:child_process";

// Renders every scene to out/<id>.mp4, then zips them into out/overlays.zip.
// Keep this list in sync with src/scenes.ts. ponytail: hardcoded — 7 ids, low churn.
const scenes = [
  "StartingSoon",
  "BRB",
  "JustChatting",
  "Streaming",
  "Coworking",
  "EndingStream",
  "Background",
];

for (const id of scenes) {
  console.log(`\n▶ Rendering ${id}…`);
  execSync(`npx remotion render ${id} out/${id}.mp4 --log=error`, { stdio: "inherit" });
}

// Socials badge → transparent. ProRes 4444 .mov (best for OBS on Apple Silicon:
// hardware-decoded, clean alpha) + a GIF for convenience.
console.log("\n▶ Rendering Socials (mov + gif)…");
execSync("npx remotion render Socials out/socials.mov --codec=prores --prores-profile=4444 --log=error", { stdio: "inherit" });
execSync("npx remotion render Socials out/socials.gif --codec=gif --log=error", { stdio: "inherit" });

// Also a GIF of the plain Background (MP4 is lighter in OBS, but handy to have).
console.log("\n▶ Rendering Background (gif)…");
execSync("npx remotion render Background out/Background.gif --codec=gif --every-nth-frame=2 --log=error", { stdio: "inherit" });

execSync("zip -j out/overlays.zip out/*.mp4 out/socials.mov out/*.gif", { stdio: "inherit" });
console.log("\n✓ Rendered + zipped → remotion/out/overlays.zip");
