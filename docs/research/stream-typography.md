# Stream typography research

Researched 2026-10-04. This is a proposed direction, not an implemented font change.

## Recommendation

Use **Plus Jakarta Sans ExtraBold (800)** for the standby headlines and **Medium (500)** for the supporting line. Keep the headline large, split deliberately across two lines, and give the supporting copy enough size to survive a smaller stream preview. This is a visual recommendation: stronger weight, open letter shapes, and a clean geometric rhythm should give the Forest Lounge layout more presence without a novelty wolf font.

The designer describes its geometric construction, taller x-height, and open counters as supporting legibility across sizes. The family includes variable weights and tabular figures. [Tokotype project](https://github.com/tokotype/PlusJakartaSans)

Suggested starting values at 1920 × 1080:

| Role | Weight | Size | Treatment |
| --- | --- | --- | --- |
| Small scene cue | 700 | 24–28 px | Uppercase, moderate tracking, cyan |
| Main headline | 800 | 112–128 px | Two lines, tight but readable tracking, white |
| Supporting line | 500 | 34–38 px | Sentence case, pale blue, generous line height |

The typography should carry the design through the long readable hold. Animate the line reveal and a restrained light pass; avoid making the letters constantly bounce, stretch, or scramble. A 20-second loop can hold the finished title for most of its duration, fade it briefly, then reveal it again. Use the same fade state at both ends of the loop so the restart is hidden. This timing is a proposed motion treatment, not a measured claim about any streamer package.

## Proxima Nova

The user's “proxlynovel” likely means **Proxima Nova**. It is a commercial family from Mark Simonson Studio, with distinct desktop and web licensing options. [Official family and licensing options](https://www.marksimonson.com/fonts/view/proxima-nova/)

It is a reasonable visual reference, but do not commit its font binaries or use an unlicensed webfont copy. An Adobe Fonts entitlement can cover finished broadcast/video output; that does not authorize redistributing the font files in this public repo or a download bundle. A public browser preview and an automated CI renderer need an appropriate font delivery/license arrangement. [Adobe Fonts licensing FAQ](https://helpx.adobe.com/fonts/web/font-licensing/font-licensing.html)

Plus Jakarta Sans is a comparable design direction, not a metric-compatible replacement for Proxima Nova. Any change needs a new layout check for line breaks and clipping.

## Open alternative and distribution

**Manrope** is another open-source modern sans-serif worth considering if a quieter, more technical look is wanted. My first choice remains Plus Jakarta Sans for this friendlier, bolder stream identity. [Official Manrope description](https://github.com/google/fonts/blob/main/ofl/manrope/DESCRIPTION.en_us.html)

Plus Jakarta Sans uses SIL Open Font License 1.1. Its font files may be bundled with software when the copyright notice and license accompany them; the font license does not impose the same licensing requirement on rendered artwork. If self-hosting it for reliable Remotion/CI renders, keep its unmodified font file and OFL notice together under the assets folder. [Official license](https://github.com/google/fonts/blob/main/ofl/plusjakartasans/OFL.txt)

No font was installed or purchased during this research. No runtime source or OBS JSON was changed.
