import struct
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from validate_stinger import _find_embedded_pcm_start, read_timing  # noqa: E402


class StingerTimingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.timing = read_timing()

    def test_checked_in_wav_matches_measured_source(self):
        self.assertEqual(self.timing.sample_rate, 48_000)
        self.assertEqual(self.timing.channels, 2)
        self.assertEqual(self.timing.wav_frames, 103_687)
        self.assertEqual(self.timing.wav_peak_frame, 8_160)
        self.assertAlmostEqual(self.timing.wav_frames / self.timing.sample_rate, 2.160145833, places=8)
        self.assertAlmostEqual(self.timing.wav_peak_seconds * 1000, 170.0, places=5)

    def test_declared_remotion_delay_lands_peak_at_scene_cut(self):
        self.assertEqual(self.timing.fps, 60)
        self.assertEqual(self.timing.duration_seconds, 4)
        self.assertEqual(self.timing.point_ms, 2_000)
        self.assertEqual(self.timing.delay_frames, 110)
        landed_ms = (self.timing.delay_frames / self.timing.fps + self.timing.wav_peak_seconds) * 1000
        self.assertLessEqual(abs(landed_ms - self.timing.point_ms), 1000 / self.timing.fps)

    def test_lossless_transcode_finds_exact_wav_at_expected_offset(self):
        source_pcm = b"".join(
            struct.pack("<hh", index % 32768, -(index % 32768))
            for index in range(self.timing.wav_frames)
        )
        expected_start = self.timing.delay_frames * self.timing.sample_rate // self.timing.fps
        decoded = bytes(expected_start * self.timing.channels * 2) + source_pcm + bytes(4096)
        self.assertEqual(
            _find_embedded_pcm_start(decoded, source_pcm, self.timing, "fixture"),
            expected_start,
        )

    def test_lossless_transcode_rejects_wav_shifted_past_one_frame(self):
        source_pcm = b"".join(
            struct.pack("<hh", index % 32768, -(index % 32768))
            for index in range(self.timing.wav_frames)
        )
        expected_start = self.timing.delay_frames * self.timing.sample_rate // self.timing.fps
        shifted_start = expected_start + 2 * self.timing.sample_rate // self.timing.fps
        decoded = bytes(shifted_start * self.timing.channels * 2) + source_pcm
        with self.assertRaisesRegex(ValueError, "within one video frame"):
            _find_embedded_pcm_start(decoded, source_pcm, self.timing, "fixture")


if __name__ == "__main__":
    unittest.main()
