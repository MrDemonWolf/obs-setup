// Proxima Nova is a licensed Adobe font (not on Google Fonts). Montserrat is the
// standard free Proxima-Nova lookalike used for the DISPLAY / titles. To use the
// real Proxima Nova: drop the files in public/fonts/ and load with @remotion/fonts.
import { loadFont as loadDisplay } from "@remotion/google-fonts/Montserrat";
// A TRUE monospace for the terminal-flavoured surfaces (mrdemonwolf.com tag,
// status line, countdown digits, loading %). JetBrains Mono reads clean at the
// 168px countdown and gives the tech/terminal look real authenticity — the old
// `mono` was Montserrat (proportional), which only faked alignment via tabular-nums.
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const displayFamily = loadDisplay("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
const monoFamily = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] }).fontFamily;

export const display = displayFamily; // headings / titles (Proxima-like)
export const mono = monoFamily; // terminal status / labels / countdown (real monospace)
