#!/usr/bin/env python3
"""Copy an OBS export into the repo, stripping secrets.

Usage:  sanitize.py <src_dir> <device_slug> <label>

- Scene collection .json  -> devices/<slug>/scenes/<name>.json  (browser
  source URLs wiped to "" because they carry secret widget tokens).
- Profile files (a folder holding basic.ini) -> devices/<slug>/profiles/<folder>/
  with service.json's stream key wiped to "".
- Anything else          -> devices/<slug>/other/<relpath>  (copied as-is).

The un-wiped full export stays in your ~/Downloads zip; only the scrubbed
copy lands in git. See docs/backup-guide.md.
"""
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)


def is_scene_collection(path):
    if not path.endswith(".json"):
        return False
    try:
        with open(path) as f:
            d = json.load(f)
    except (ValueError, OSError):
        return False
    return isinstance(d, dict) and "scene_order" in d and "sources" in d


def wipe_scene_urls(path, dest):
    with open(path) as f:
        d = json.load(f)
    wiped = 0
    for src in d.get("sources", []):
        sid = src.get("versioned_id") or src.get("id") or ""
        if sid.startswith("browser_source"):
            s = src.get("settings", {})
            if s.get("url"):
                s["url"] = ""
                wiped += 1
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return wiped


def wipe_service_key(path, dest):
    with open(path) as f:
        d = json.load(f)
    hit = False
    settings = d.get("settings", {})
    if settings.get("key"):
        settings["key"] = ""
        hit = True
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return hit


def main():
    if len(sys.argv) != 4:
        sys.exit("usage: sanitize.py <src_dir> <device_slug> <label>")
    src_dir, slug, label = sys.argv[1], sys.argv[2], sys.argv[3]
    if not os.path.isdir(src_dir):
        sys.exit(f"source dir not found: {src_dir}")

    dest_root = os.path.join(REPO, "devices", slug)
    # profile folders = any dir that directly contains basic.ini
    profile_dirs = {
        os.path.dirname(os.path.join(root, "basic.ini"))
        for root, _, files in os.walk(src_dir) if "basic.ini" in files
    }

    scenes, keys_wiped, urls_wiped = [], 0, 0
    for root, _, files in os.walk(src_dir):
        for name in files:
            if name == ".DS_Store" or name.endswith(".zip"):
                continue
            full = os.path.join(root, name)
            if is_scene_collection(full):
                dest = os.path.join(dest_root, "scenes", name)
                urls_wiped += wipe_scene_urls(full, dest)
                scenes.append(f"scenes/{name}")
            elif root in profile_dirs:
                prof = os.path.basename(root)
                dest = os.path.join(dest_root, "profiles", prof, name)
                if name == "service.json":
                    keys_wiped += 1 if wipe_service_key(full, dest) else 0
                else:
                    os.makedirs(os.path.dirname(dest), exist_ok=True)
                    shutil.copy2(full, dest)
            else:
                rel = os.path.relpath(full, src_dir)
                dest = os.path.join(dest_root, "other", rel)
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                shutil.copy2(full, dest)

    with open(os.path.join(dest_root, "index.json"), "w") as f:
        json.dump({"device": slug, "label": label, "scenes": sorted(scenes)}, f, indent=2)
        f.write("\n")

    print(f"device: {label} ({slug})")
    print(f"scene collections: {len(scenes)}  (browser URLs wiped: {urls_wiped})")
    print(f"stream keys wiped: {keys_wiped}")


if __name__ == "__main__":
    main()
