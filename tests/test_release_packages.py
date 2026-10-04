import sys
import tempfile
import unittest
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from validate_release_packages import (  # noqa: E402
    OVERLAY_FILES,
    STINGER_FILES,
    validate_overlay_archive,
    validate_stinger_archive,
)


class ReleasePackageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)

    def make_zip(self, name, members):
        archive_path = self.directory / name
        with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for member in members:
                archive.writestr(f"{archive_path.stem}/{member}", "fixture")
        return archive_path

    def test_overlay_archive_has_all_videos_masks_and_no_stinger(self):
        self.assertEqual(len(OVERLAY_FILES), 12)
        self.assertIn("countdown-hevc.mov", OVERLAY_FILES)
        self.assertIn("countdown-10m-hevc.mov", OVERLAY_FILES)
        masks = {"co-working-solo.png", "just-chatting-cam.png"}
        members = {"README.md"}
        members.update(f"Overlays/{name}" for name in OVERLAY_FILES)
        members.update(f"Masks/{name}" for name in masks)
        archive = self.make_zip("OBS-overlays-2026-10-03.zip", members)
        validate_overlay_archive(archive, masks)

    def test_overlay_archive_rejects_stinger_leak(self):
        members = {"README.md", "Stinger/stinger.wav"}
        members.update(f"Overlays/{name}" for name in OVERLAY_FILES)
        members.add("Masks/co-working-solo.png")
        archive = self.make_zip("OBS-overlays-2026-10-03.zip", members)
        with self.assertRaisesRegex(ValueError, "must not contain stinger"):
            validate_overlay_archive(archive, {"co-working-solo.png"})

    def test_stinger_archive_has_video_source_audio_and_instructions(self):
        archive = self.make_zip(
            "OBS-stinger-2026-10-03.zip",
            STINGER_FILES,
        )
        validate_stinger_archive(archive)

    def test_stinger_archive_rejects_missing_wav(self):
        archive = self.make_zip(
            "OBS-stinger-2026-10-03.zip",
            STINGER_FILES - {"stinger.wav"},
        )
        with self.assertRaisesRegex(ValueError, "stinger.wav"):
            validate_stinger_archive(archive)


if __name__ == "__main__":
    unittest.main()
