#!/usr/bin/env python3
"""Generate an import-ready OBS scene collection for a device.

Run:  python3 scripts/gen_scene_collection.py

Emits  devices/macbook-pro/scenes/MBP-Streaming.json  (import via
OBS -> Scene Collection -> Import) plus  devices/macbook-pro/index.json
(read by the HTML previewer).

Everything is data-driven by LAYOUT below. Colours are stored the way OBS
stores them: private_settings.color on the *scene item*, as a signed 32-bit
ABGR integer (0xAABBGGRR). We compute those ints from hex here so you never
hand-edit them. See docs/obs-json-reference.md.

Browser source URLs ship EMPTY on purpose (they carry secret widget tokens).
Paste your real URLs in OBS after importing.
"""
import json
import os
import uuid

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
OUT_DIR = os.path.join(REPO, "devices", "macbook-pro", "scenes")
INDEX = os.path.join(REPO, "devices", "macbook-pro", "index.json")
COLLECTION_NAME = "MBP Streaming"
OUT_FILE = os.path.join(OUT_DIR, "MBP-Streaming.json")

NS = uuid.uuid5(uuid.NAMESPACE_URL, "obs-setup/macbook-pro")

# --- Colour palette (source of truth: docs/color-coding.md) ------------------
# category -> hex. Stored per-item as ABGR int; the previewer reads it back.
# The 8 OBS built-in preset colors (right-click a source -> Color), one per
# category. Matches the live rig in OBS.
PALETTE = {
    "camera": "#2EA043",     # green        - webcam (you, live)
    "alerts": "#8957E5",     # purple       - Alerts Group (sound + Twitch)
    "widgets": "#1F9EA6",    # teal         - Wolfathon widgets (wheel/rewards/timer)
    "nowplaying": "#388BFD",  # blue        - WolfWave now-playing widget
    "screen": "#BB8009",     # yellow       - screen / display capture (when added)
    "standby": "#DA3633",     # red         - standby video (Starting Soon / BRB)
    "audio": "#8B949E",      # gray (light) - Audio Group (Discord/Chrome/Apple Music)
    "background": "#6E7681",  # gray (dark) - background image
}

# Background / standby images live here (Google Drive, this Mac). Not portable to
# other machines; the previewer just reads the path, OBS points the source at it.
SCENES_IMAGES = ("/Users/nathanialhenniges/Library/CloudStorage/"
                 "GoogleDrive-nathanial.henniges@mrdemonwolf.com/My Drive/"
                 "MultiMedia Projects/Social Media/Twitch/Scenes Images")


def abgr(hex_color):
    """#RRGGBB -> signed 32-bit ABGR int (opaque), how OBS stores item colour."""
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    unsigned = (0xFF << 24) | (b << 16) | (g << 8) | r
    return unsigned - (1 << 32) if unsigned >= (1 << 31) else unsigned


def suid(name):
    return str(uuid.uuid5(NS, name))


# --- Layout ------------------------------------------------------------------
# Leaf sources (the real inputs). browser urls empty -> you paste them in OBS.
LEAVES = [
    {"name": "Webcam", "id": "av_capture_input", "cat": "camera",
     "settings": {}},
    {"name": "Sound Alerts Box", "id": "browser_source", "cat": "alerts",
     "settings": {"url": "", "width": 1920, "height": 1080}},
    {"name": "Twitch Alerts Box", "id": "browser_source", "cat": "alerts",
     "settings": {"url": "", "width": 1920, "height": 1080}},
    {"name": "Wheel of Dares", "id": "browser_source", "cat": "widgets",
     "settings": {"url": "", "width": 1920, "height": 1080}},
    {"name": "Rewards", "id": "browser_source", "cat": "widgets",
     "settings": {"url": "", "width": 1920, "height": 1080}},
    {"name": "Timer", "id": "browser_source", "cat": "widgets",
     "settings": {"url": "", "width": 1920, "height": 1080}},
    {"name": "WolfWave Widget", "id": "browser_source", "cat": "nowplaying",
     "settings": {"url": "", "width": 1920, "height": 1080}},
    # Per-app audio on newest OBS (30+) = "macOS Audio Capture" (SCK, macOS 13+),
    # id "sck_audio_capture". Set mode to Application + pick the app in OBS;
    # `application` is the app bundle id.
    {"name": "Discord", "id": "sck_audio_capture", "cat": "audio",
     "settings": {"application": "com.hnc.Discord"}},
    {"name": "Google Chrome", "id": "sck_audio_capture", "cat": "audio",
     "settings": {"application": "com.google.Chrome"}},
    {"name": "Apple Music", "id": "sck_audio_capture", "cat": "audio",
     "settings": {"application": "com.apple.Music"}},
    {"name": "Starting Soon Video", "id": "ffmpeg_source", "cat": "standby",
     "settings": {"local_file": SCENES_IMAGES + "/", "looping": True}},
    {"name": "Background", "id": "image_source", "cat": "background",
     "settings": {"file": SCENES_IMAGES + "/"}},
]
# No text sources: standby uses video / background images from SCENES_IMAGES.
TEXT_LEAVES = []

# [src] wrapper scenes: reusable building blocks. These mirror the OBS Groups on
# the live rig (Alerts Group, Wolfathon, Audio).
SRC_SCENES = [
    {"name": "[src] Alerts", "items": [("Sound Alerts Box", "alerts"), ("Twitch Alerts Box", "alerts")]},
    {"name": "[src] Wolfathon", "items": [("Wheel of Dares", "widgets"), ("Rewards", "widgets"), ("Timer", "widgets")]},
    {"name": "[src] Audio", "items": [("Discord", "audio"), ("Google Chrome", "audio"), ("Apple Music", "audio")]},
]

# Main scenes. Item order = top to bottom in OBS; Background sits last so it's the
# bottom layer, Audio just above it (audio has no visible pixels anyway).
MAIN_SCENES = [
    {"name": "Starting Soon", "items": [("Starting Soon Video", "standby"), ("[src] Alerts", "alerts"),
                                        ("[src] Audio", "audio"), ("Background", "background")]},
    {"name": "Be Right Back", "items": [("Starting Soon Video", "standby"), ("[src] Alerts", "alerts"),
                                        ("[src] Audio", "audio"), ("Background", "background")]},
    {"name": "Stream", "items": [("Webcam", "camera"), ("WolfWave Widget", "nowplaying"),
                                 ("[src] Wolfathon", "widgets"), ("[src] Alerts", "alerts"),
                                 ("[src] Audio", "audio"), ("Background", "background")]},
    {"name": "Co-Working", "items": [("Webcam", "camera"), ("WolfWave Widget", "nowplaying"),
                                     ("[src] Wolfathon", "widgets"), ("[src] Alerts", "alerts"),
                                     ("[src] Audio", "audio"), ("Background", "background")]},
]

# Empty scene used as a visual divider in the scene list (community trick).
DIVIDERS = ["──────"]

# Left-dock order, top to bottom.
SCENE_ORDER = (
    ["Starting Soon", "Be Right Back", "Stream", "Co-Working", DIVIDERS[0]]
    + [s["name"] for s in SRC_SCENES]
)


# --- Builders ----------------------------------------------------------------
def base_source(name, sid, settings, vid=None):
    return {
        "name": name, "uuid": suid(name), "id": sid,
        "versioned_id": vid or sid, "settings": settings,
        "mixers": 0, "sync": 0, "flags": 0, "volume": 1.0, "balance": 0.5,
        "enabled": True, "muted": False,
        "push-to-mute": False, "push-to-mute-delay": 0,
        "push-to-talk": False, "push-to-talk-delay": 0,
        "hotkeys": {}, "deinterlace_mode": 0, "deinterlace_field_order": 0,
        "monitoring_type": 0, "private_settings": {}, "filters": [],
    }


def scene_item(item_id, name, cat):
    it = {
        "name": name, "source_uuid": suid(name), "visible": True, "locked": False,
        "rot": 0.0, "pos": {"x": 0.0, "y": 0.0}, "scale": {"x": 1.0, "y": 1.0},
        "align": 5, "bounds_type": 0, "bounds_align": 0, "bounds": {"x": 0.0, "y": 0.0},
        "crop_left": 0, "crop_top": 0, "crop_right": 0, "crop_bottom": 0,
        "id": item_id, "group_item_backup": False, "scale_filter": "disable",
        "blend_method": "default", "blend_type": "normal",
        "show_transition": {"duration": 0}, "hide_transition": {"duration": 0},
        "private_settings": {},
    }
    if cat:
        it["private_settings"] = {"color": abgr(PALETTE[cat]), "color-preset": 0}
    return it


def scene_source(name, items):
    built, counter = [], 0
    for src_name, cat in items:
        counter += 1
        built.append(scene_item(counter, src_name, cat))
    src = base_source(name, "scene", {
        "id_counter": counter, "custom_size": False, "items": built,
    })
    return src


def build():
    sources = []

    # Leaf inputs.
    for lf in LEAVES:
        sources.append(base_source(lf["name"], lf["id"], lf["settings"]))
    for t in TEXT_LEAVES:
        sources.append(base_source(t["name"], "text_ft2_source", {
            "text": t["text"],
            "font": {"face": "Helvetica Neue", "flags": 0, "size": 96, "style": "Bold"},
            "color1": 4294967295, "color2": 4294967295, "outline": True,
        }, vid="text_ft2_source_v2"))

    # Scenes: [src] wrappers, main scenes, dividers.
    for sc in SRC_SCENES + MAIN_SCENES:
        sources.append(scene_source(sc["name"], sc["items"]))
    for d in DIVIDERS:
        sources.append(scene_source(d, []))

    return {
        "current_scene": "Starting Soon",
        "current_program_scene": "Starting Soon",
        "scene_order": [{"name": n} for n in SCENE_ORDER],
        "name": COLLECTION_NAME,
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


def selfcheck():
    # ABGR byte order: red must land in the LOW byte.
    assert abgr("#FF0000") == -16776961, abgr("#FF0000")   # red  -> low byte
    assert abgr("#00FF00") == -16711936, abgr("#00FF00")   # green -> mid byte
    assert abgr("#0000FF") == -65536, abgr("#0000FF")      # blue -> high byte
    # every referenced source name must exist as a real source
    names = {lf["name"] for lf in LEAVES} | {t["name"] for t in TEXT_LEAVES}
    names |= {s["name"] for s in SRC_SCENES + MAIN_SCENES} | set(DIVIDERS)
    for sc in SRC_SCENES + MAIN_SCENES:
        for ref, _ in sc["items"]:
            assert ref in names, f"scene item references missing source: {ref}"


def main():
    selfcheck()
    os.makedirs(OUT_DIR, exist_ok=True)
    collection = build()
    with open(OUT_FILE, "w") as f:
        json.dump(collection, f, indent=2, ensure_ascii=False)
        f.write("\n")
    with open(INDEX, "w") as f:
        json.dump({
            "device": "macbook-pro",
            "label": "MacBook Pro",
            "scenes": ["scenes/MBP-Streaming.json"],
        }, f, indent=2)
        f.write("\n")
    print(f"wrote {OUT_FILE}")
    print(f"wrote {INDEX}")
    print(f"{len(collection['sources'])} sources, {len(SCENE_ORDER)} scenes in order")


if __name__ == "__main__":
    main()
