import sys
import tempfile
import unittest
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from validate_release_packages import (  # noqa: E402
    SCENE_FILES,
    SCENE_GROUPS,
    STINGER_FILES,
    validate_mask_archive,
    validate_scene_archive,
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

    def test_scene_archive_groups_scenes_extras_and_backgrounds(self):
        self.assertEqual(len(SCENE_FILES), 15)
        self.assertIn("countdown-hevc.mov", SCENE_FILES)
        self.assertIn("countdown-10m-hevc.mov", SCENE_FILES)
        self.assertEqual(set(SCENE_GROUPS), {"Scenes", "Extras", "Backgrounds"})
        self.assertEqual(len(SCENE_GROUPS["Scenes"]), 7)
        self.assertEqual(len(SCENE_GROUPS["Extras"]), 5)
        self.assertEqual(len(SCENE_GROUPS["Backgrounds"]), 3)
        members = {"README.md", "README.pdf"}
        members.update(f"{folder}/{name}" for folder, names in SCENE_GROUPS.items() for name in names)
        archive = self.make_zip("OBS-scenes-2026-10-14.zip", members)
        validate_scene_archive(archive)

    def test_scene_archive_rejects_mask_leak(self):
        members = {"README.md", "README.pdf"}
        members.update(f"{folder}/{name}" for folder, names in SCENE_GROUPS.items() for name in names)
        members.add("Masks/co-working-solo.png")
        archive = self.make_zip("OBS-scenes-2026-10-14.zip", members)
        with self.assertRaisesRegex(ValueError, "must not contain masks"):
            validate_scene_archive(archive)

    def test_scene_archive_rejects_stinger_leak(self):
        members = {"README.md", "README.pdf"}
        members.update(f"{folder}/{name}" for folder, names in SCENE_GROUPS.items() for name in names)
        members.add("Stinger/stinger.wav")
        archive = self.make_zip("OBS-scenes-2026-10-14.zip", members)
        with self.assertRaisesRegex(ValueError, "Stinger files"):
            validate_scene_archive(archive)

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

    def test_mask_archive_contains_masks_and_guide_only(self):
        masks = {"co-working-solo.png", "just-chatting-cam.png"}
        archive = self.make_zip(
            "OBS-masks-2026-10-14.zip",
            {"README.md", "README.pdf", *masks},
        )
        validate_mask_archive(archive, masks)


if __name__ == "__main__":
    unittest.main()
