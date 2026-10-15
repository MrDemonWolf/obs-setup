import struct
import sys
import unittest
from unittest.mock import patch
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from validate_stinger import (  # noqa: E402
    _find_embedded_pcm_start,
    check_stinger_coverage,
    hold_sample_times,
    read_timing,
)


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

    def test_opaque_hold_brackets_scene_cut_with_margin(self):
        self.assertLessEqual(self.timing.hold_start_ms, self.timing.point_ms - 300)
        self.assertGreaterEqual(self.timing.hold_end_ms, self.timing.point_ms + 300)
        self.assertLess(self.timing.hold_end_ms, self.timing.duration_seconds * 1000)
        samples = hold_sample_times(self.timing)
        self.assertEqual(samples[0] * 1000, self.timing.hold_start_ms)
        self.assertEqual(samples[-1] * 1000, self.timing.hold_end_ms)
        self.assertIn(self.timing.point_ms / 1000, samples)

    def test_hevc_endpoint_allows_only_one_alpha_quantization_level(self):
        duration_frames = round(self.timing.duration_seconds * self.timing.fps)
        last_frame_time = (duration_frames - 1) / self.timing.fps
        alpha_level = [1]

        def bounds(_path, when, _width, _height):
            if abs(when - last_frame_time) < 1e-6:
                return 0, alpha_level[0]
            if when == 0:
                return 0, 0
            return 255, 255

        with patch(
            "validate_stinger._probe",
            return_value={"streams": [{"codec_type": "video", "width": 1, "height": 1}]},
        ), patch("validate_stinger._alpha_bounds", side_effect=bounds):
            with self.assertRaisesRegex(ValueError, "tolerance 0/255"):
                check_stinger_coverage(Path("encoded.mov"), self.timing)
            check_stinger_coverage(Path("encoded.mov"), self.timing, endpoint_alpha_tolerance=1)
            alpha_level[0] = 2
            with self.assertRaisesRegex(ValueError, "max alpha 2"):
                check_stinger_coverage(Path("encoded.mov"), self.timing, endpoint_alpha_tolerance=1)

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
