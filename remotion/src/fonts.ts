// Proxima Nova is a licensed Adobe font (not on Google Fonts). Montserrat is the
// standard free Proxima-Nova lookalike. To use the real Proxima Nova: drop the
// font files in public/fonts/ and load them here with @remotion/fonts loadFont.
import { loadFont } from "@remotion/google-fonts/Montserrat";

const family = loadFont("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;

export const display = family; // headings / titles
export const mono = family; // status / labels (kept name for compatibility)
