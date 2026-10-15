#!/usr/bin/env python3
"""Check that release scene, Stinger, and mask archives stay separate."""

from __future__ import annotations

import argparse
import sys
import zipfile
from pathlib import Path, PurePosixPath


SCENE_GROUPS = {
    "Scenes": frozenset({
        "01-starting-soon.mp4",
        "02-just-chatting.mp4",
        "03-just-chatting-vtuber.mp4",
        "04-co-working-solo.mp4",
        "05-co-working-dual.mp4",
        "06-be-right-back.mp4",
        "07-ending-stream.mp4",
    }),
    "Backgrounds": frozenset({
        "background.mp4",
        "coffee-background.mp4",
        "cabin-background.mp4",
    }),
    "Extras": frozenset({
        "socials-badge-hevc.mov",
        "loading-barks-hevc.mov",
        "countdown-hevc.mov",
        "countdown-10m-hevc.mov",
        "desk-foreground-hevc.mov",
    }),
}
SCENE_FILES = frozenset().union(*SCENE_GROUPS.values())
GUIDE_FILES = frozenset({"README.md", "README.pdf"})
STINGER_FILES = GUIDE_FILES | frozenset({"stinger-hevc.mov", "stinger.wav"})


def _relative_files(path: Path) -> tuple[str, set[str]]:
    with zipfile.ZipFile(path) as archive:
        bad_entry = archive.testzip()
        if bad_entry is not None:
            raise ValueError(f"{path} has a corrupt ZIP entry: {bad_entry}")
        names = [name for name in archive.namelist() if name and not name.endswith("/")]

    if not names:
        raise ValueError(f"{path} is empty")
    parts = [PurePosixPath(name).parts for name in names]
    roots = {item[0] for item in parts if item}
    expected_root = path.stem
    if roots != {expected_root}:
        raise ValueError(f"{path} must contain only its {expected_root}/ folder; found {sorted(roots)}")
    relative = {"/".join(item[1:]) for item in parts}
    return expected_root, relative


def validate_scene_archive(path: Path) -> None:
    _, files = _relative_files(path)
    expected = set(GUIDE_FILES)
    expected.update(f"{folder}/{name}" for folder, names in SCENE_GROUPS.items() for name in names)
    if any("stinger" in name.lower() for name in files):
        raise ValueError(f"{path} must not contain Stinger files; they are in a separate download")
    if any(name.startswith("Masks/") for name in files):
        raise ValueError(f"{path} must not contain masks; they are in a separate download")
    if files != expected:
        raise ValueError(
            f"{path} scene files mismatch; missing={sorted(expected - files)}, "
            f"extra={sorted(files - expected)}"
        )


def validate_mask_archive(path: Path, expected_masks: set[str]) -> None:
    _, files = _relative_files(path)
    expected = {*GUIDE_FILES, *expected_masks}
    if files != expected:
        raise ValueError(
            f"{path} mask files mismatch; missing={sorted(expected - files)}, "
            f"extra={sorted(files - expected)}"
        )


def validate_stinger_archive(path: Path) -> None:
    _, files = _relative_files(path)
    if files != STINGER_FILES:
        raise ValueError(
            f"{path} must contain exactly {sorted(STINGER_FILES)}; "
            f"missing={sorted(STINGER_FILES - files)}, extra={sorted(files - STINGER_FILES)}"
        )


def validate_packages(
    scenes_zip: Path, stinger_zip: Path, masks_zip: Path, mask_directory: Path
) -> None:
    masks = {item.name for item in mask_directory.glob("*.png")}
    if not masks:
        raise ValueError(f"no PNG masks found in {mask_directory}")
    validate_scene_archive(scenes_zip)
    validate_stinger_archive(stinger_zip)
    validate_mask_archive(masks_zip, masks)
    print(
        f"✓ Release archives: {len(SCENE_FILES)} scene/add-on/background videos, the Stinger video/audio, "
        f"and {len(masks)} masks are in three separate ZIPs."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("scenes_zip", type=Path)
    parser.add_argument("stinger_zip", type=Path)
    parser.add_argument("masks_zip", type=Path)
    parser.add_argument("--masks-dir", type=Path, required=True)
    args = parser.parse_args()
    try:
        validate_packages(args.scenes_zip, args.stinger_zip, args.masks_zip, args.masks_dir)
    except (OSError, ValueError, zipfile.BadZipFile) as error:
        print(f"release package validation failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
