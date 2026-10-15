#!/usr/bin/env python3
"""Combine the three validated OBS release archives into one master ZIP."""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

from validate_release_packages import SCENE_GROUPS


def _extract_package(archive_path: Path, destination: Path) -> Path:
    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive_path) as archive:
        archive.extractall(destination)
    roots = [item for item in destination.iterdir() if item.is_dir()]
    if len(roots) != 1:
        raise ValueError(f"{archive_path} must contain one package folder")
    return roots[0]


def _write_master_readme(scene_readme: Path, output: Path) -> None:
    content = scene_readme.read_text(encoding="utf-8")
    content = content.replace("# MrDemonWolf OBS Scenes", "# MrDemonWolf OBS Asset Bundle", 1)
    content = content.replace(
        "Webcam masks and the Stinger are separate downloads.",
        "Scenes, add-ons, backgrounds, webcam masks, and the Stinger are organized in this one bundle.",
        1,
    )
    content = content.replace(
        "This package contains the scene and widget videos. Download the matching\n"
        "`OBS-masks-*.zip` for camera masks and `OBS-stinger-*.zip` for the scene transition.",
        "This bundle contains the scene and widget videos, webcam masks, and Stinger transition. "
        "Each asset type has its own folder, with setup instructions included in `Masks/` and `Stinger/`.",
        1,
    )
    content = content.replace(
        "The Stinger is a separate download because it has its own HEVC-alpha video and\n"
        "embedded audio. Download the matching `OBS-stinger-*.zip` from the same release, then\n"
        "follow the included setup README or [`docs/stinger-setup.md`](https://github.com/MrDemonWolf/obs-setup/blob/main/docs/stinger-setup.md).",
        "The Stinger transition is in `Stinger/`. Follow its included README to install it in OBS.",
        1,
    )
    for mask_name in (
        "co-working-solo.png", "co-working-dual-big.png", "co-working-dual-small.png",
        "just-chatting-cam.png", "just-chatting-chat.png",
    ):
        content = content.replace(f"`{mask_name}`", f"`Masks/{mask_name}`")
    output.write_text(content, encoding="utf-8")


def build_master(scenes_zip: Path, stinger_zip: Path, masks_zip: Path, output: Path, guide_renderer: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="obs-master-") as temp:
        temp_path = Path(temp)
        scenes = _extract_package(scenes_zip, temp_path / "scenes")
        stinger = _extract_package(stinger_zip, temp_path / "stinger")
        masks = _extract_package(masks_zip, temp_path / "masks")
        master = temp_path / output.stem
        master.mkdir()

        scene_readme = scenes / "README.md"
        for folder in SCENE_GROUPS:
            shutil.copytree(scenes / folder, master / folder)
        shutil.copytree(stinger, master / "Stinger")
        shutil.copytree(masks, master / "Masks")

        _write_master_readme(scene_readme, master / "README.md")
        subprocess.run(
            [sys.executable, str(guide_renderer), str(master / "README.md"), str(master / "README.pdf")],
            check=True,
        )
        with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            for path in sorted(master.rglob("*")):
                if path.is_file():
                    archive.write(path, path.relative_to(temp_path).as_posix())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("scenes_zip", type=Path)
    parser.add_argument("stinger_zip", type=Path)
    parser.add_argument("masks_zip", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--guide-renderer", type=Path, required=True)
    args = parser.parse_args()
    try:
        build_master(args.scenes_zip, args.stinger_zip, args.masks_zip, args.output, args.guide_renderer)
    except (OSError, ValueError, zipfile.BadZipFile, subprocess.CalledProcessError) as error:
        print(f"master package build failed: {error}", file=sys.stderr)
        return 1
    print(f"✓ Master OBS asset bundle → {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
