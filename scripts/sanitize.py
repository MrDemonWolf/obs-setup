#!/usr/bin/env python3
"""Copy OBS settings into the repo, stripping secrets.

Usage:  sanitize.py <src_dir> <device_slug> <label>

- Scene collection .json  -> devices/<slug>/scenes/<name>.json (URLs and
  credential fields wiped).
- Profile files (a folder holding basic.ini) -> devices/<slug>/profiles/<folder>/
  with service.json's stream key and basic.ini account tokens wiped.
- Anything else          -> raw Google Drive backup only (not copied to git).

The raw OBS settings stay in your Google Drive backup zip; only the scrubbed
copy lands in git. See docs/backup-guide.md.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.environ.get("OBS_REPO_DIR", os.path.dirname(HERE))


def secret_key(key):
    key = key.lower()
    return key in {"url", "cookieid"} or key.endswith("key") or any(
        word in key for word in ("token", "secret", "password", "credential", "auth")
    )


def scrub(data):
    if isinstance(data, dict):
        return {key: "" if secret_key(key) else scrub(value)
                for key, value in data.items()}
    if isinstance(data, list):
        return [scrub(value) for value in data]
    return data


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
    wiped = sum(1 for src in d.get("sources", [])
                 if isinstance(src.get("settings"), dict) and src["settings"].get("url"))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        json.dump(scrub(d), f, indent=2, ensure_ascii=False)
        f.write("\n")
    return wiped


def wipe_service_key(path, dest):
    with open(path) as f:
        d = json.load(f)
    hit = False
    settings = d.get("settings", {})
    if isinstance(settings, dict) and settings.get("key"):
        settings["key"] = ""
        hit = True
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        json.dump(scrub(d), f, indent=2, ensure_ascii=False)
        f.write("\n")
    return hit


def wipe_ini(path, dest):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(path) as src, open(dest, "w") as out:
        for line in src:
            if "=" in line and secret_key(line.split("=", 1)[0].strip()):
                out.write(line.split("=", 1)[0] + "=\n")
            else:
                out.write(line)


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

    scenes, keys_wiped, urls_wiped, copied, skipped = [], 0, 0, 0, []
    for root, _, files in os.walk(src_dir):
        for name in files:
            if name == ".DS_Store" or name.endswith(".zip"):
                continue
            full = os.path.join(root, name)
            rel = os.path.relpath(full, src_dir)
            if os.path.islink(full):
                skipped.append(rel)
                continue
            if is_scene_collection(full):
                dest = os.path.join(dest_root, "scenes", name)
                urls_wiped += wipe_scene_urls(full, dest)
                scenes.append(f"scenes/{name}")
                copied += 1
            elif root in profile_dirs and name in ("basic.ini", "service.json"):
                prof = os.path.basename(root)
                dest = os.path.join(dest_root, "profiles", prof, name)
                if name == "service.json":
                    keys_wiped += 1 if wipe_service_key(full, dest) else 0
                else:
                    os.makedirs(os.path.dirname(dest), exist_ok=True)
                    wipe_ini(full, dest)
                copied += 1
            else:
                skipped.append(rel)

    if not copied:
        sys.exit("No supported OBS scene collections or profile files found")

    # index lists EVERYTHING in scenes/ (not just this walk), so a generated
    # collection (gen_scene_collection.py) and this backup coexist. Keep in
    # sync with write_index() in gen_scene_collection.py.
    all_scenes = sorted(
        "scenes/" + n
        for n in os.listdir(os.path.join(dest_root, "scenes"))
        if n.endswith(".json")
    ) if os.path.isdir(os.path.join(dest_root, "scenes")) else sorted(scenes)
    with open(os.path.join(dest_root, "index.json"), "w") as f:
        json.dump({"device": slug, "label": label, "scenes": all_scenes}, f, indent=2)
        f.write("\n")

    print(f"device: {label} ({slug})")
    print(f"scene collections: {len(scenes)}  (browser URLs wiped: {urls_wiped})")
    print(f"stream keys wiped: {keys_wiped}")
    if skipped:
        print("kept only in the raw backup (not copied to git):")
        for rel in skipped:
            print(f"  {rel}")


if __name__ == "__main__":
    main()
