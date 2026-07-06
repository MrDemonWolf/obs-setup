// Match mrdemonwolf.com's brand type: Montserrat for the DISPLAY / headings and
// Open Sans for BODY / labels. (The site is Divi — global `body{}` is Open Sans,
// headings use Montserrat.) Both are on Google Fonts, loaded via @remotion/google-fonts.
import { loadFont as loadDisplay } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/OpenSans";

const displayFamily = loadDisplay("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
const bodyFamily = loadBody("normal", { weights: ["400", "600", "700"], subsets: ["latin"] }).fontFamily;

export const display = displayFamily; // headings / titles — mrdemonwolf.com header font (Montserrat)
export const body = bodyFamily; // status lines / labels / tags / numbers — mrdemonwolf.com body font (Open Sans)
