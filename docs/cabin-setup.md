# Moonlit cabin: OBS setup

The cabin scene and desk foreground are separate videos. This lets a VTuber
model sit behind the desk instead of looking like a floating head.

## Source order

OBS lists the highest visible layer first. Use this order:

1. Chat, tasks, timer, and other widgets.
2. `desk-foreground-hevc.mov` — transparent foreground Media Source.
3. Your VTuber model or camera.
4. The cabin scene video.

Set both cabin and desk sources to **1920×1080 at position 0,0**, with Loop ON.
Use the HEVC-alpha desk file in OBS on macOS. `desk-foreground.mov` is the
ProRes 4444 alpha master; it is useful for editing but much larger.

## Desk bounds

- The solid desktop begins at **y=860** and fills the bottom of the canvas.
- Position your model so its head and shoulders are above y=860. The lower
  crop is covered by the desk.
- The coffee mug occupies approximately **x=1090–1247, y=785–895**.
- Steam drifts upward above the mug in a seamless **8-second** loop.
- Keep chat clear of the coffee/steam area; the foreground contains no text,
  camera frame, or background image.

Add the desk to VTuber or workspace scenes where a foreground makes sense.
For screen-sharing or large camera layouts, leave it hidden if it covers
important content. The desk does not need an image mask.

## Camera and chat placement

For Just Chatting, the camera frame is **1120×630 at x=96, y=190**. Chat is
**528×650 at x=1328, y=190** in both Just Chatting variants. Match your source
transform to these bounds and apply the corresponding camera/chat PNG mask
if its corners need clipping. The VTuber variant leaves the model area open.

The chatting videos already show the same desk for preview and background
continuity; the separate transparent desk goes above the model to create the
foreground occlusion. Co-Working keeps the cabin without the desk layer so
camera and widget space stays available.

## Render

From `remotion/`:

```bash
npx remotion render DeskForeground out/desk-foreground.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --muted
```

```bash
./to-hevc.sh out/desk-foreground.mov
```

The regular release pipeline includes the desk in the overlay ZIP. The
stinger stays in its separate package.
