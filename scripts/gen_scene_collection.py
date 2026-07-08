#!/usr/bin/env python3
"""Generate import-ready OBS scene collections, one per device.

Run:  python3 scripts/gen_scene_collection.py

Emits, per device in DEVICES below:
  devices/<slug>/scenes/<file>.json   (import via OBS -> Scene Collection -> Import)
  devices/<slug>/index.json           (read by the HTML previewer; lists every
                                       .json in that device's scenes/ dir, so
                                       generated + backed-up collections coexist)

Everything is data-driven by the per-device LAYOUT dicts. Colours are stored
the way OBS stores them: private_settings.color on the *scene item*, as a
signed 32-bit ABGR integer (0xAABBGGRR). We compute those ints from hex here
so you never hand-edit them. See docs/obs-json-reference.md.

Scene item lists below read TOP -> BOTTOM like the OBS Sources panel; the
builder REVERSES them on write because OBS renders the JSON array first ->
last, i.e. the FIRST array element is the BOTTOM layer. (Verified against a
live OBS 32 export.)

Browser source URLs ship EMPTY on purpose (they carry secret widget tokens).
Paste your real URLs in OBS after importing.
"""
import glob
import json
import os
import uuid

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

# --- Colour palette (source of truth: docs/color-coding.md) ------------------
# category -> hex. Stored per-item as ABGR int; the previewer reads it back.
# The 8 OBS built-in preset colors (right-click a source -> Color), one per
# category. Matches the live rig in OBS.
PALETTE = {
    "camera": "#2EA043",     # green        - webcam / cam feeds (you, live)
    "alerts": "#8957E5",     # purple       - Alerts (chat + sound + Twitch)
    "widgets": "#1F9EA6",    # teal         - Wolfathon widgets (wheel/rewards/timer)
    "nowplaying": "#388BFD",  # blue        - Now Playing (WolfWave)
    "screen": "#BB8009",     # yellow       - screen / display capture (when added)
    "standby": "#DA3633",     # red         - standby videos (Starting Soon / BRB / Ending)
    "audio": "#8B949E",      # gray (light) - Audio (Discord / Chrome / Apple Music)
    "background": "#6E7681",  # gray (dark) - background / overlay-frame videos
}

# Google Drive media roots (this user's Macs; not portable).
_DRIVE = ("/Users/nathanialhenniges/Library/CloudStorage/"
          "GoogleDrive-nathanial.henniges@mrdemonwolf.com/My Drive/"
          "MultiMedia Projects/Social Media/Twitch")
SCENES_IMAGES = _DRIVE + "/Scenes Images"   # MacBook Pro standby/background images
OVERLAY_VIDEOS = _DRIVE + "/Overlays"       # rendered overlay bundle videos


def abgr(hex_color):
    """#RRGGBB -> signed 32-bit ABGR int (opaque), how OBS stores item colour."""
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    unsigned = (0xFF << 24) | (b << 16) | (g << 8) | r
    return unsigned - (1 << 32) if unsigned >= (1 << 31) else unsigned


def bs(w=1920, h=1080):
    """Browser-source settings with the URL left empty (token boundary)."""
    return {"url": "", "width": w, "height": h}


# --- Device layouts -----------------------------------------------------------
# Scene "items" entries are either (name, cat) tuples, or dicts for items that
# need a transform / start hidden:
#   {"name": ..., "cat": ..., "pos": (x, y), "bounds": (w, h), "visible": False}
# bounds -> OBS "Scale to inner bounds" (bounds_type 2): the source lands at
# exactly that box (16:9 into 16:9 = exact fit) — used to pin cams into the
# overlay cam frames (coords must match masks/gen_masks.py + the bundle README).

MACBOOK_PRO = {
    "slug": "macbook-pro",
    "label": "MacBook Pro",
    "collection": "MBP Streaming",
    "file": "MBP-Streaming.json",
    "current": "Starting Soon",
    # Leaf sources (the real inputs). browser urls empty -> paste in OBS.
    "leaves": [
        {"name": "Webcam", "id": "av_capture_input", "cat": "camera",
         "settings": {}},
        {"name": "Sound Alerts", "id": "browser_source", "cat": "alerts",
         "settings": bs()},
        {"name": "Twitch Alerts", "id": "browser_source", "cat": "alerts",
         "settings": bs()},
        {"name": "Wheel of Dares", "id": "browser_source", "cat": "widgets",
         "settings": bs()},
        {"name": "Rewards", "id": "browser_source", "cat": "widgets",
         "settings": bs()},
        {"name": "Timer", "id": "browser_source", "cat": "widgets",
         "settings": bs()},
        {"name": "Now Playing", "id": "browser_source", "cat": "nowplaying",
         "settings": bs()},
        # Per-app audio on newest OBS (30+) = "macOS Audio Capture" (SCK,
        # macOS 13+), id "sck_audio_capture". Mode Application + pick the app
        # in OBS; `application` is the app bundle id.
        {"name": "Discord", "id": "sck_audio_capture", "cat": "audio",
         "settings": {"application": "com.hnc.Discord"}},
        {"name": "Google Chrome", "id": "sck_audio_capture", "cat": "audio",
         "settings": {"application": "com.google.Chrome"}},
        {"name": "Apple Music", "id": "sck_audio_capture", "cat": "audio",
         "settings": {"application": "com.apple.Music"}},
        {"name": "Starting Soon Video", "id": "ffmpeg_source", "cat": "standby",
         "settings": {"local_file": SCENES_IMAGES + "/", "looping": True}},
        {"name": "Be Right Back Video", "id": "ffmpeg_source", "cat": "standby",
         "settings": {"local_file": SCENES_IMAGES + "/", "looping": True}},
        {"name": "Background", "id": "image_source", "cat": "background",
         "settings": {"file": SCENES_IMAGES + "/"}},
    ],
    # [src] wrapper scenes: reusable building blocks (mirror OBS Groups on the
    # live rig, but per-scene-editable where they need to be).
    "src_scenes": [
        {"name": "[src] Alerts", "items": [("Sound Alerts", "alerts"), ("Twitch Alerts", "alerts")]},
        {"name": "[src] Wolfathon", "items": [("Wheel of Dares", "widgets"), ("Rewards", "widgets"), ("Timer", "widgets")]},
        {"name": "[src] Audio", "items": [("Discord", "audio"), ("Google Chrome", "audio"), ("Apple Music", "audio")]},
    ],
    # Main scenes, items TOP -> BOTTOM (like the OBS Sources panel).
    "main_scenes": [
        {"name": "Starting Soon", "items": [("Starting Soon Video", "standby"), ("[src] Alerts", "alerts"),
                                            ("[src] Audio", "audio"), ("Background", "background")]},
        {"name": "Be Right Back", "items": [("Be Right Back Video", "standby"), ("[src] Alerts", "alerts"),
                                            ("[src] Audio", "audio"), ("Background", "background")]},
        {"name": "Live", "items": [("Webcam", "camera"), ("Now Playing", "nowplaying"),
                                   ("[src] Wolfathon", "widgets"), ("[src] Alerts", "alerts"),
                                   ("[src] Audio", "audio"), ("Background", "background")]},
        {"name": "Co-Working", "items": [("Webcam", "camera"), ("Now Playing", "nowplaying"),
                                         ("[src] Wolfathon", "widgets"), ("[src] Alerts", "alerts"),
                                         ("[src] Audio", "audio"), ("Background", "background")]},
    ],
    "dividers": ["──────"],
    "scene_order": ["Starting Soon", "Be Right Back", "Live", "Co-Working", "──────",
                    "[src] Alerts", "[src] Wolfathon", "[src] Audio"],
}

# Mac Mini (main home rig, OBS 32) — realigned to the live 2026-07 export with
# fixes: typo'd names cleaned ("Co-workking Main Cam", "Co-Workng Video"),
# the empty global "Wolfathon" group replaced by PER-SCENE [src] wrappers
# (edit one scene's widget layout without touching the others), full colour
# coding, and cams pinned to the overlay cam-frame coords (masks/gen_masks.py).
# "Rewards" vs "Rewards - Right" is INTENTIONAL (user convention): the same
# widget as two position-variant sources, toggled by visibility to switch
# left/right focus per what's on screen. Keep both.
MAC_MINI = {
    "slug": "mac-mini",
    "label": "Mac Mini",
    "collection": "Mini Streaming",
    "file": "Mini-Streaming.json",
    "current": "Starting Soon",
    "leaves": [
        # Cams / feeds. "macos-avcapture" = OBS 32 macOS Video Capture id
        # (the live rig's own id; older av_capture_input auto-migrates).
        {"name": "Main Cam", "id": "macos-avcapture", "cat": "camera",
         "settings": {}},
        {"name": "Second Cam", "id": "macos-avcapture", "cat": "camera",
         "settings": {}},
        {"name": "NDI Source", "id": "ndi_source", "cat": "camera",
         "settings": {}},
        {"name": "PNG Tuber", "id": "syphon-input", "cat": "camera",
         "settings": {}},
        # Widgets (browser). URLs empty = paste tokens in OBS after import.
        {"name": "Chat Overlay", "id": "browser_source", "cat": "alerts",
         "settings": bs()},
        {"name": "Sound Alerts", "id": "browser_source", "cat": "alerts",
         "settings": bs()},
        {"name": "Twitch Alerts", "id": "browser_source", "cat": "alerts",
         "settings": bs()},
        {"name": "Wheel of Dares", "id": "browser_source", "cat": "widgets",
         "settings": bs()},
        {"name": "Rewards", "id": "browser_source", "cat": "widgets",
         "settings": bs()},
        {"name": "Rewards - Right", "id": "browser_source", "cat": "widgets",
         "settings": bs()},
        {"name": "Timer", "id": "browser_source", "cat": "widgets",
         "settings": bs()},
        {"name": "Now Playing", "id": "browser_source", "cat": "nowplaying",
         "settings": bs()},
        # Per-app audio (macOS Audio Capture / ScreenCaptureKit).
        {"name": "Discord", "id": "sck_audio_capture", "cat": "audio",
         "settings": {"application": "com.hnc.Discord"}},
        {"name": "Google Chrome", "id": "sck_audio_capture", "cat": "audio",
         "settings": {"application": "com.google.Chrome"}},
        {"name": "Apple Music", "id": "sck_audio_capture", "cat": "audio",
         "settings": {"application": "com.apple.Music"}},
        # Overlay videos from the rendered bundle, synced to Google Drive.
        {"name": "Starting Soon Video", "id": "ffmpeg_source", "cat": "standby",
         "settings": {"local_file": OVERLAY_VIDEOS + "/01-starting-soon.mp4", "looping": True}},
        {"name": "Be Right Back Video", "id": "ffmpeg_source", "cat": "standby",
         "settings": {"local_file": OVERLAY_VIDEOS + "/06-be-right-back.mp4", "looping": True}},
        {"name": "Ending Video", "id": "ffmpeg_source", "cat": "standby",
         "settings": {"local_file": OVERLAY_VIDEOS + "/07-ending-stream.mp4", "looping": True}},
        {"name": "Background Video", "id": "ffmpeg_source", "cat": "background",
         "settings": {"local_file": OVERLAY_VIDEOS + "/background.mp4", "looping": True}},
        {"name": "Co-Working Solo Video", "id": "ffmpeg_source", "cat": "background",
         "settings": {"local_file": OVERLAY_VIDEOS + "/04-co-working-solo.mp4", "looping": True}},
        {"name": "Co-Working Dual Video", "id": "ffmpeg_source", "cat": "background",
         "settings": {"local_file": OVERLAY_VIDEOS + "/05-co-working-dual.mp4", "looping": True}},
    ],
    "src_scenes": [
        {"name": "[src] Alerts", "items": [("Chat Overlay", "alerts"), ("Sound Alerts", "alerts"),
                                           ("Twitch Alerts", "alerts")]},
        {"name": "[src] Audio", "items": [("Discord", "audio"), ("Google Chrome", "audio"),
                                          ("Apple Music", "audio")]},
        # Per-scene Wolfathon wrappers — the same widget sources, one wrapper
        # per main scene, so each scene's widget arrangement is independent.
        # Arrange each wrapper once in OBS (drag inside the [src] scene).
        # Solo carries BOTH Rewards variants (left hidden, right visible —
        # matching the live rig): toggle visibility to flip screen focus.
        {"name": "[src] Wolfathon · Live", "items": [("Wheel of Dares", "widgets"),
                                                     ("Rewards", "widgets"), ("Timer", "widgets")]},
        {"name": "[src] Wolfathon · Co-Working Solo", "items": [
            ("Wheel of Dares", "widgets"),
            {"name": "Rewards", "cat": "widgets", "visible": False},
            ("Rewards - Right", "widgets"),
            ("Timer", "widgets")]},
        {"name": "[src] Wolfathon · Co-Working Dual", "items": [("Wheel of Dares", "widgets"),
                                                                ("Rewards", "widgets"), ("Timer", "widgets")]},
    ],
    # Cam boxes = the overlay cam-frame coords (masks/gen_masks.py + bundle README).
    "main_scenes": [
        {"name": "Starting Soon", "items": [
            ("Starting Soon Video", "standby"),
            ("Now Playing", "nowplaying"),
            ("[src] Alerts", "alerts"),
            ("[src] Audio", "audio"),
        ]},
        {"name": "Live", "items": [
            {"name": "PNG Tuber", "cat": "camera", "pos": (0, 0), "bounds": (1920, 1080)},
            {"name": "NDI Source", "cat": "camera", "pos": (0, 0), "bounds": (1920, 1080), "visible": False},
            ("[src] Wolfathon · Live", "widgets"),
            ("[src] Alerts", "alerts"),
            ("[src] Audio", "audio"),
            ("Background Video", "background"),
        ]},
        {"name": "Co-Working [Solo]", "items": [
            {"name": "Main Cam", "cat": "camera", "pos": (64, 136), "bounds": (1400, 788)},
            ("Now Playing", "nowplaying"),
            ("[src] Wolfathon · Co-Working Solo", "widgets"),
            ("[src] Alerts", "alerts"),
            ("[src] Audio", "audio"),
            ("Co-Working Solo Video", "background"),
        ]},
        {"name": "Co-Working [Multi]", "items": [
            {"name": "Main Cam", "cat": "camera", "pos": (64, 136), "bounds": (1152, 648)},
            {"name": "Second Cam", "cat": "camera", "pos": (1280, 628), "bounds": (576, 324)},
            ("Now Playing", "nowplaying"),
            ("[src] Wolfathon · Co-Working Dual", "widgets"),
            ("[src] Alerts", "alerts"),
            ("[src] Audio", "audio"),
            ("Co-Working Dual Video", "background"),
        ]},
        {"name": "Be Right Back", "items": [
            ("Be Right Back Video", "standby"),
            ("[src] Alerts", "alerts"),
            ("[src] Audio", "audio"),
        ]},
        {"name": "Ending", "items": [
            ("Ending Video", "standby"),
            ("[src] Audio", "audio"),
        ]},
    ],
    "dividers": ["──────"],
    "scene_order": ["Starting Soon", "Live", "Co-Working [Solo]", "Co-Working [Multi]",
                    "Be Right Back", "Ending", "──────",
                    "[src] Alerts", "[src] Audio", "[src] Wolfathon · Live",
                    "[src] Wolfathon · Co-Working Solo", "[src] Wolfathon · Co-Working Dual"],
}

DEVICES = [MACBOOK_PRO, MAC_MINI]


# --- Builders ----------------------------------------------------------------
# Source ids that can carry audio: their `mixers` (OBS audio-track bitmask)
# must be non-zero or the imported source is routed to NO tracks — silent on
# stream/recording until re-ticked in Advanced Audio Properties. 255 = all
# tracks, matching the live rig's export.
AUDIO_IDS = {"sck_audio_capture", "ffmpeg_source", "ndi_source",
             "macos-avcapture", "av_capture_input"}


def base_source(suid, name, sid, settings, vid=None):
    return {
        "name": name, "uuid": suid(name), "id": sid,
        "versioned_id": vid or sid, "settings": settings,
        "mixers": 255 if sid in AUDIO_IDS else 0,
        "sync": 0, "flags": 0, "volume": 1.0, "balance": 0.5,
        "enabled": True, "muted": False,
        "push-to-mute": False, "push-to-mute-delay": 0,
        "push-to-talk": False, "push-to-talk-delay": 0,
        "hotkeys": {}, "deinterlace_mode": 0, "deinterlace_field_order": 0,
        "monitoring_type": 0, "private_settings": {}, "filters": [],
    }


def norm_item(spec):
    """(name, cat) tuple or dict -> dict with defaults."""
    if isinstance(spec, dict):
        return spec
    name, cat = spec
    return {"name": name, "cat": cat}


def scene_item(suid, item_id, spec):
    name, cat = spec["name"], spec.get("cat")
    pos = spec.get("pos")
    bounds = spec.get("bounds")
    it = {
        "name": name, "source_uuid": suid(name), "visible": spec.get("visible", True),
        "locked": False,
        "rot": 0.0,
        "pos": {"x": float(pos[0]), "y": float(pos[1])} if pos else {"x": 0.0, "y": 0.0},
        "scale": {"x": 1.0, "y": 1.0},
        "align": 5,
        # bounds_type 2 = Scale to inner bounds: source fits exactly the box.
        "bounds_type": 2 if bounds else 0, "bounds_align": 0,
        "bounds": {"x": float(bounds[0]), "y": float(bounds[1])} if bounds else {"x": 0.0, "y": 0.0},
        "crop_left": 0, "crop_top": 0, "crop_right": 0, "crop_bottom": 0,
        "id": item_id, "group_item_backup": False, "scale_filter": "disable",
        "blend_method": "default", "blend_type": "normal",
        "show_transition": {"duration": 0}, "hide_transition": {"duration": 0},
        "private_settings": {},
    }
    if cat:
        it["private_settings"] = {"color": abgr(PALETTE[cat]), "color-preset": 0}
    return it


def scene_source(suid, name, items):
    # Items are authored TOP -> BOTTOM (like the OBS Sources panel) but OBS
    # renders the JSON array first -> last (first = bottom layer), so reverse.
    built, counter = [], 0
    for spec in reversed([norm_item(i) for i in items]):
        counter += 1
        built.append(scene_item(suid, counter, spec))
    return base_source(suid, name, "scene", {
        "id_counter": counter, "custom_size": False, "items": built,
    })


def build(dev):
    ns = uuid.uuid5(uuid.NAMESPACE_URL, "obs-setup/" + dev["slug"])
    suid = lambda name: str(uuid.uuid5(ns, name))  # noqa: E731

    sources = []
    for lf in dev["leaves"]:
        sources.append(base_source(suid, lf["name"], lf["id"], lf["settings"]))
    for sc in dev["src_scenes"] + dev["main_scenes"]:
        sources.append(scene_source(suid, sc["name"], sc["items"]))
    for d in dev["dividers"]:
        sources.append(scene_source(suid, d, []))

    return {
        "current_scene": dev["current"],
        "current_program_scene": dev["current"],
        "scene_order": [{"name": n} for n in dev["scene_order"]],
        "name": dev["collection"],
        "sources": sources,
        "groups": [],
        "quick_transitions": [
            {"name": "Cut", "duration": 300, "hotkeys": [], "id": 1, "fade_to_black": False},
            {"name": "Fade", "duration": 300, "hotkeys": [], "id": 2, "fade_to_black": False},
        ],
        "transitions": [
            {"name": "Fade", "id": "fade_transition", "versioned_id": "fade_transition", "settings": {}},
        ],
        "current_transition": "Fade",
        "transition_duration": 300,
        "preview_locked": False,
        "scaling_enabled": False,
        "scaling_level": 0,
        "scaling_off_x": 0.0,
        "scaling_off_y": 0.0,
        "virtual-camera": {"type2": 3},
        "modules": {},
    }


def write_index(slug, label):
    """index.json lists every scene collection present in devices/<slug>/scenes.

    Both this generator and scripts/sanitize.py write it this way, so a
    generated collection and a sanitized live backup coexist.
    """
    dest_root = os.path.join(REPO, "devices", slug)
    scenes = sorted(
        "scenes/" + os.path.basename(p)
        for p in glob.glob(os.path.join(dest_root, "scenes", "*.json"))
    )
    path = os.path.join(dest_root, "index.json")
    with open(path, "w") as f:
        json.dump({"device": slug, "label": label, "scenes": scenes}, f, indent=2)
        f.write("\n")
    return path


def selfcheck():
    # ABGR byte order: red must land in the LOW byte.
    assert abgr("#FF0000") == -16776961, abgr("#FF0000")   # red  -> low byte
    assert abgr("#00FF00") == -16711936, abgr("#00FF00")   # green -> mid byte
    assert abgr("#0000FF") == -65536, abgr("#0000FF")      # blue -> high byte
    for dev in DEVICES:
        # names must be UNIQUE across leaves + scenes + dividers: suid() keys
        # uuid5 on the name alone, so a duplicate would emit two sources with
        # the same uuid and scene items would resolve ambiguously on import.
        all_names = ([lf["name"] for lf in dev["leaves"]]
                     + [s["name"] for s in dev["src_scenes"] + dev["main_scenes"]]
                     + list(dev["dividers"]))
        assert len(all_names) == len(set(all_names)), \
            f"{dev['slug']}: duplicate source/scene names: " \
            f"{sorted(n for n in all_names if all_names.count(n) > 1)}"
        names = set(all_names)
        for sc in dev["src_scenes"] + dev["main_scenes"]:
            for spec in sc["items"]:
                spec = norm_item(spec)
                assert spec["name"] in names, \
                    f"{dev['slug']}: scene item references missing source: {spec['name']}"
                assert spec.get("cat") is None or spec["cat"] in PALETTE, \
                    f"{dev['slug']}: unknown palette category: {spec.get('cat')}"
        for n in dev["scene_order"]:
            assert n in names, f"{dev['slug']}: scene_order references missing scene: {n}"
        # every browser source ships with an EMPTY url (token boundary)
        for lf in dev["leaves"]:
            if lf["id"] == "browser_source":
                assert lf["settings"].get("url", "") == "", \
                    f"{dev['slug']}: browser source {lf['name']} must ship url=\"\""


def main():
    selfcheck()
    for dev in DEVICES:
        out_dir = os.path.join(REPO, "devices", dev["slug"], "scenes")
        os.makedirs(out_dir, exist_ok=True)
        out_file = os.path.join(out_dir, dev["file"])
        collection = build(dev)
        with open(out_file, "w") as f:
            json.dump(collection, f, indent=2, ensure_ascii=False)
            f.write("\n")
        index = write_index(dev["slug"], dev["label"])
        print(f"wrote {out_file}")
        print(f"wrote {index}")
        print(f"  {len(collection['sources'])} sources, "
              f"{len(dev['scene_order'])} scenes in order")


if __name__ == "__main__":
    main()
