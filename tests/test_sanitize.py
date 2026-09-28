import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


REPO_ROOT = Path(__file__).resolve().parents[1]
SANITIZER = REPO_ROOT / "scripts" / "sanitize.py"


class SanitizeCliTests(unittest.TestCase):
    def test_copies_supported_files_and_scrubs_credentials(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "obs-export"
            destination = root / "repo"
            (source / "scenes").mkdir(parents=True)
            profile = source / "profiles" / "Streaming"
            profile.mkdir(parents=True)

            (source / "scenes" / "Streaming.json").write_text(json.dumps({
                "scene_order": ["Main"],
                "sources": [{
                    "name": "Browser",
                    "settings": {
                        "url": "https://private.example/stream-key",
                        "auth_token": "scene-token",
                        "width": 1920,
                    },
                }],
            }))
            (profile / "service.json").write_text(json.dumps({
                "settings": {"key": "stream-key", "server": "rtmp://example.test"},
            }))
            (profile / "basic.ini").write_text(
                "[General]\nRefreshToken=profile-token\nName=Streaming\n"
            )

            env = {**os.environ, "OBS_REPO_DIR": str(destination)}
            subprocess.run(
                [sys.executable, str(SANITIZER), str(source), "test-device", "Test Device"],
                check=True,
                capture_output=True,
                text=True,
                env=env,
            )

            device = destination / "devices" / "test-device"
            scene = json.loads((device / "scenes" / "Streaming.json").read_text())
            service = json.loads((device / "profiles" / "Streaming" / "service.json").read_text())
            ini = (device / "profiles" / "Streaming" / "basic.ini").read_text()
            index = json.loads((device / "index.json").read_text())

            self.assertEqual(scene["sources"][0]["settings"]["url"], "")
            self.assertEqual(scene["sources"][0]["settings"]["auth_token"], "")
            self.assertEqual(scene["sources"][0]["settings"]["width"], 1920)
            self.assertEqual(service["settings"]["key"], "")
            self.assertEqual(service["settings"]["server"], "rtmp://example.test")
            self.assertIn("RefreshToken=\n", ini)
            self.assertIn("Name=Streaming", ini)
            self.assertEqual(index["scenes"], ["scenes/Streaming.json"])


if __name__ == "__main__":
    unittest.main()
