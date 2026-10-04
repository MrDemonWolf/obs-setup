#!/usr/bin/env python3
"""Check that release archives are complete and keep the stinger separate."""

from __future__ import annotations

import argparse
import sys
import zipfile
from pathlib import Path, PurePosixPath


OVERLAY_FILES = frozenset(
    {
        "01-starting-soon.mp4",
        "02-just-chatting.mp4",
        "03-just-chatting-vtuber.mp4",
        "04-co-working-solo.mp4",
        "05-co-working-dual.mp4",
        "06-be-right-back.mp4",
        "07-ending-stream.mp4",
        "background.mp4",
        "socials-badge-hevc.mov",
        "loading-barks-hevc.mov",
        "countdown-hevc.mov",
    }
)
STINGER_FILES = frozenset({"README.md", "stinger-hevc.mov", "stinger.wav"})


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


def validate_overlay_archive(path: Path, expected_masks: set[str]) -> None:
    _, files = _relative_files(path)
    required = {f"Overlays/{name}" for name in OVERLAY_FILES}
    required.add("README.md")
    actual_videos = {name for name in files if name.startswith("Overlays/")}
    if actual_videos != {f"Overlays/{name}" for name in OVERLAY_FILES}:
        missing = sorted(required - files)
        extra = sorted(actual_videos - {f"Overlays/{name}" for name in OVERLAY_FILES})
        raise ValueError(f"{path} overlay files mismatch; missing={missing}, extra={extra}")
    actual_masks = {name.removeprefix("Masks/") for name in files if name.startswith("Masks/")}
    if actual_masks != expected_masks:
        raise ValueError(
            f"{path} masks mismatch; missing={sorted(expected_masks - actual_masks)}, "
            f"extra={sorted(actual_masks - expected_masks)}"
        )
    if "README.md" not in files:
        raise ValueError(f"{path} is missing README.md")
    if any("stinger" in name.lower() for name in files):
        raise ValueError(f"{path} must not contain stinger files; they are in a separate download")
    expected = required | {f"Masks/{name}" for name in expected_masks}
    if files != expected:
        raise ValueError(f"{path} has unexpected entries: {sorted(files - expected)}")


def validate_stinger_archive(path: Path) -> None:
    _, files = _relative_files(path)
    if files != STINGER_FILES:
        raise ValueError(
            f"{path} must contain exactly {sorted(STINGER_FILES)}; "
            f"missing={sorted(STINGER_FILES - files)}, extra={sorted(files - STINGER_FILES)}"
        )


def validate_packages(overlay_zip: Path, stinger_zip: Path, mask_directory: Path) -> None:
    masks = {item.name for item in mask_directory.glob("*.png")}
    if not masks:
        raise ValueError(f"no PNG masks found in {mask_directory}")
    validate_overlay_archive(overlay_zip, masks)
    validate_stinger_archive(stinger_zip)
    print(
        f"✓ Release archives: {len(OVERLAY_FILES)} overlay videos, {len(masks)} masks; "
        "the stinger video, WAV, and instructions are in their own ZIP."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("overlay_zip", type=Path)
    parser.add_argument("stinger_zip", type=Path)
    parser.add_argument("--masks-dir", type=Path, required=True)
    args = parser.parse_args()
    try:
        validate_packages(args.overlay_zip, args.stinger_zip, args.masks_dir)
    except (OSError, ValueError, zipfile.BadZipFile) as error:
        print(f"release package validation failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
