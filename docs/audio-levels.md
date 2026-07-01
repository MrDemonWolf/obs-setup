# Audio levels (per-source Compressor)

Target levels for each audio source, dialed in with a **Compressor** filter
(right-click the source → Filters → Audio Filters → **+** → Compressor).

## How the compressor sets a level

A compressor does not, on its own, move a source to a target level. Two knobs
do the work:

- **Threshold + Ratio** clamp the loud peaks so the source never blows past the
  top of its lane.
- **Output Gain** is the knob that actually moves the level. Watch the source's
  meter in the Audio Mixer and nudge Output Gain until peaks park at the top of
  the lane.

Set **Threshold** a few dB under the lane ceiling, pick a **Ratio** (harder for
music/game, gentle for voice), then raise **Output Gain** until the meter peaks
sit in the lane. **Attack 6 ms / Release 60 ms** works for every source.

## Lanes and settings

Voice is the anchor; every other source sits *under* it by a fixed offset so
nothing competes. Keep each source in its own lane and they stack cleanly into
a `-6` to `-3` dBFS master peak.

| Source                          | Lane (peak dBFS) | Ratio | Threshold | Output Gain (start) |
| ------------------------------- | ---------------- | ----- | --------- | ------------------- |
| Mic (your voice)                | -9 to -6         | 3:1   | -18 dB    | +6, tune peak to ~-6  |
| Discord (friends)               | -15 to -12       | 4:1   | -18 dB    | +3, tune peak to ~-12 |
| Game audio                      | -24 to -16       | 4:1   | -20 dB    | 0, tune peak to ~-16  |
| Apple Music / Chrome (music)    | -35 to -25       | 8:1   | -30 dB    | pull *fader* down     |

Output Gain is a starting point only — every input runs hot or quiet
differently, so trust the meter, not the number.

**Music is the exception:** app music comes in loud, so its level is set by
pulling the source **fader** down (to ~-30), not by Output Gain. The compressor
just tames peaks. If a stream is game-audio-heavy, drop music another 5 dB
(toward -40) so it stays under the game SFX. Rule of thumb: music sits **18-20
dB below your voice** (W3C accessibility guidance for speech vs. non-speech).

## Master bus

Twitch does **not** loudness-normalize — you own the final level end to end. Two
things to add on the master (or the mic):

- **Limiter at -3 dB.** Platforms re-encode the stream; anything near 0 dBFS
  distorts on their side. A limiter at -3 is a hard safety ceiling.
- Aim the mix for roughly **-14 LUFS** integrated with **true peak below -1.5
  dBTP** — the loudness most platforms target. Use an OBS loudness-meter plugin
  to watch it live; without one, trust the peak lanes above.

If each source sits in its lane, the summed master peaks land in **-6 to -3
dBFS** on their own. If the master runs hot, pull the loudest source (usually
mic or game) down a couple dB rather than compressing the master.

## Why these numbers

Two reference charts float around and they disagree:

- A **dBFS-lane chart** (voice -12/-6, game -24/-16, music -30/-20) — balanced,
  leaves headroom. This is the right skeleton and the tables above follow it.
- An **"Audio Mixer OBS" chart** (voice **-5, "red zone is good"**, music
  -45/-35) — a gaming-tilt profile. Its one good idea is pushing music low; its
  bad idea is chasing the red zone at -5, which leaves almost no headroom and
  invites transcode distortion. Not adopted.

The tables blend the balanced chart with pro guidance: voice peaks -12 to -6
(never -5-in-the-red), music dropped ~5 dB lower than the lane chart to sit
under speech, and the master Limiter + LUFS target that neither chart mentions.

Sources: [theCafeterium — OBS levels](https://thecafeterium.com/2023/03/28/setting-the-correct-audio-levels-in-obs-for-streaming/),
[OBS Audio Mixer Guide](https://obsproject.com/kb/audio-mixer-guide),
[Special Agent Squeaky — LUFS for OBS](https://www.specialagentsqueaky.com/blog/setting-perfect-obs-studio-audio-using-lufs/),
[Pure Audio Insight — background music level](https://pureaudioinsight.com/blogs/content-production/background-music-volume-how-loud-should-it-be).

## Quick reference

| Meter                | Target range        |
| -------------------- | ------------------- |
| Your voice (mic)     | -9 to -6 peak       |
| Discord voices       | -15 to -12 peak     |
| Game audio           | -24 to -16 peak     |
| Music / SFX          | -35 to -25 peak     |
| Master bus (total)   | -6 to -3 peak, ~-14 LUFS, limiter at -3 |

General rule: aim peaks between -6 and -3 dBFS, never hit 0 (0 dBFS = clipping).
