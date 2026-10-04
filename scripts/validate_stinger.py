#!/usr/bin/env python3
"""Validate the stinger's WAV timing and, after rendering, its embedded audio.

The timing check uses only the Python standard library. Render validation needs
ffmpeg/ffprobe, both of which are already required by the release pipeline.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import struct
import subprocess
import wave
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_WAV = ROOT / "remotion/public/stinger.wav"
STINGER_SOURCE = ROOT / "remotion/src/Stinger.tsx"


@dataclass(frozen=True)
class Timing:
    fps: int
    duration_seconds: float
    point_ms: float
    declared_peak_ms: float
    delay_frames: int
    wav_peak_frame: int
    wav_peak_seconds: float
    sample_rate: int
    channels: int
    wav_frames: int


def _number_constant(source: str, name: str) -> float:
    match = re.search(
        rf"(?m)^\s*(?:export\s+)?const\s+{re.escape(name)}\s*=\s*"
        r"([0-9]+(?:\.[0-9]+)?)\s*;",
        source,
    )
    if not match:
        raise ValueError(f"could not read numeric {name} from {STINGER_SOURCE}")
    return float(match.group(1))


def _wav_peak(path: Path) -> tuple[int, int, int, int, int]:
    with wave.open(str(path), "rb") as wav:
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        sample_rate = wav.getframerate()
        frame_count = wav.getnframes()
        if wav.getcomptype() != "NONE":
            raise ValueError("stinger.wav must be uncompressed PCM")
        if sample_width != 2:
            raise ValueError(f"stinger.wav must be 16-bit PCM; found {sample_width * 8}-bit")
        raw = wav.readframes(frame_count)

    if not channels or not sample_rate or not frame_count:
        raise ValueError("stinger.wav is empty or has invalid audio metadata")
    samples = struct.unpack(f"<{len(raw) // 2}h", raw)
    peak_sample_index, peak_sample = max(enumerate(samples), key=lambda item: abs(item[1]))
    peak_frame = peak_sample_index // channels
    return channels, sample_rate, frame_count, peak_frame, abs(peak_sample)


def read_timing(wav_path: Path = SOURCE_WAV, source_path: Path = STINGER_SOURCE) -> Timing:
    source = source_path.read_text()
    fps = int(_number_constant(source, "STINGER_FPS"))
    seconds = _number_constant(source, "STINGER_SECONDS")
    cover = _number_constant(source, "STINGER_COVER")
    peak_ms = _number_constant(source, "STINGER_SFX_PEAK_MS")

    point_formula = re.search(
        r"STINGER_POINT_MS\s*=\s*Math\.round\(\s*STINGER_COVER\s*\*\s*"
        r"STINGER_SECONDS\s*\*\s*1000\s*\)",
        source,
    )
    if not point_formula:
        raise ValueError("STINGER_POINT_MS must be derived from the cover fraction and clip duration")

    delay_match = re.search(
        r"(?m)^\s*(?:export\s+)?const\s+STINGER_SFX_DELAY_FRAMES\s*=\s*([^;]+);",
        source,
    )
    if not delay_match:
        raise ValueError("STINGER_SFX_DELAY_FRAMES must be declared in Stinger.tsx")
    delay_expression = delay_match.group(1)
    for required_name in ("STINGER_POINT_MS", "STINGER_SFX_PEAK_MS", "STINGER_FPS"):
        if required_name not in delay_expression:
            raise ValueError(f"stinger audio delay must derive from {required_name}")
    normalized_delay = re.sub(r",\)", ")", re.sub(r"\s+", "", delay_expression))
    expected_delay = (
        "Math.max(0,Math.round(((STINGER_POINT_MS-STINGER_SFX_PEAK_MS)"
        "*STINGER_FPS)/1000))"
    )
    if normalized_delay != expected_delay:
        raise ValueError(
            "stinger audio delay must round (cover time − measured WAV peak) × fps to frames"
        )

    sequence = re.search(
        r"<Sequence\s+from=\{\s*STINGER_SFX_DELAY_FRAMES\s*\}\s*>", source
    )
    if not sequence:
        raise ValueError("the audio Sequence must start at STINGER_SFX_DELAY_FRAMES")

    channels, sample_rate, wav_frames, peak_frame, peak_value = _wav_peak(wav_path)
    if peak_value == 0:
        raise ValueError("stinger.wav has no audible samples")

    declared_point_ms = round(cover * seconds * 1000)
    if fps <= 0 or seconds <= 0 or cover < 0 or cover > 1:
        raise ValueError("invalid stinger duration, frame rate, or cover position")
    if not math.isclose(seconds * fps, round(seconds * fps), abs_tol=1e-9):
        raise ValueError("stinger duration must resolve to a whole number of frames")

    tolerance_seconds = 1 / fps
    peak_seconds = peak_frame / sample_rate
    if abs(peak_ms / 1000 - peak_seconds) > tolerance_seconds:
        raise ValueError(
            f"declared SFX peak ({peak_ms:.3f} ms) does not match WAV peak "
            f"({peak_seconds * 1000:.3f} ms) within one frame ({tolerance_seconds * 1000:.3f} ms)"
        )

    delay_frames = math.floor(((declared_point_ms - peak_ms) / 1000) * fps + 0.5)
    if delay_frames < 0:
        raise ValueError("stinger audio peak occurs after the cover point")
    landed_seconds = delay_frames / fps + peak_seconds
    if abs(landed_seconds - declared_point_ms / 1000) > tolerance_seconds:
        raise ValueError(
            f"WAV peak lands at {landed_seconds * 1000:.3f} ms, not the "
            f"{declared_point_ms} ms cover point (tolerance: one {1000 / fps:.3f} ms frame)"
        )

    return Timing(
        fps=fps,
        duration_seconds=seconds,
        point_ms=declared_point_ms,
        declared_peak_ms=peak_ms,
        delay_frames=delay_frames,
        wav_peak_frame=peak_frame,
        wav_peak_seconds=peak_seconds,
        sample_rate=sample_rate,
        channels=channels,
        wav_frames=wav_frames,
    )


def _probe(path: Path) -> dict:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def _video_stream(probe: dict, path: Path) -> dict:
    streams = [item for item in probe.get("streams", []) if item.get("codec_type") == "video"]
    if len(streams) != 1:
        raise ValueError(f"{path} must contain one video stream; found {len(streams)}")
    return streams[0]


def _audio_stream(probe: dict, path: Path) -> dict:
    streams = [item for item in probe.get("streams", []) if item.get("codec_type") == "audio"]
    if len(streams) != 1:
        raise ValueError(f"{path} must contain one audio stream; found {len(streams)}")
    return streams[0]


def _find_embedded_pcm_start(
    decoded: bytes, source_pcm: bytes, timing: Timing, stream_name: str
) -> int:
    """Find the exact lossless WAV copy and verify its peak reaches the cut."""
    frame_bytes = timing.channels * 2
    if len(source_pcm) != timing.wav_frames * frame_bytes:
        raise ValueError("stinger.wav PCM byte count changed while reading it")
    if len(decoded) % frame_bytes:
        raise ValueError(f"{stream_name} decoded audio ends inside a sample frame")

    expected_start = timing.delay_frames * timing.sample_rate // timing.fps
    tolerance = timing.sample_rate // timing.fps
    decoded_frames = len(decoded) // frame_bytes
    lower = max(0, expected_start - tolerance)
    upper = min(decoded_frames, expected_start + tolerance + timing.wav_frames)
    start_byte = decoded.find(source_pcm, lower * frame_bytes, upper * frame_bytes)
    if start_byte < 0 or start_byte % frame_bytes:
        raise ValueError(
            f"{stream_name} does not contain the exact WAV within one video frame "
            f"of its expected start at frame {timing.delay_frames}"
        )

    start_sample = start_byte // frame_bytes
    peak_seconds = (start_sample + timing.wav_peak_frame) / timing.sample_rate
    if abs(peak_seconds - timing.point_ms / 1000) > 1 / timing.fps:
        raise ValueError(
            f"{stream_name} WAV peak lands at {peak_seconds * 1000:.3f} ms, outside one frame "
            f"of the {timing.point_ms} ms scene-cut point"
        )
    return start_sample


def _rgba_frame(path: Path, time_seconds: float, width: int, height: int) -> bytes:
    result = subprocess.run(
        [
            "ffmpeg", "-v", "error", "-i", str(path), "-ss", f"{time_seconds:.6f}",
            "-frames:v", "1", "-pix_fmt", "rgba", "-f", "rawvideo", "pipe:1",
        ],
        check=True,
        capture_output=True,
    ).stdout
    expected_size = width * height * 4
    if len(result) != expected_size:
        raise ValueError(f"could not decode an RGBA frame from {path}")
    return result


def validate_hevc_alpha(path: Path, *, cover_time_ms: int | None = None) -> None:
    probe = _probe(path)
    video = _video_stream(probe, path)
    if video.get("codec_name") != "hevc" or video.get("codec_tag_string") != "hvc1":
        raise ValueError(f"{path} must be HEVC in an hvc1 QuickTime stream")

    width, height = int(video["width"]), int(video["height"])
    initial = _rgba_frame(path, 0, width, height)
    if initial[3] != 0:
        raise ValueError(f"{path} does not preserve a transparent corner")

    if cover_time_ms is not None:
        covered = _rgba_frame(path, cover_time_ms / 1000, width, height)
        center = ((height // 2) * width + width // 2) * 4
        if covered[center + 3] != 255:
            raise ValueError(f"{path} is not opaque at the Stinger scene-cut point")


def _check_video(video: dict, path: Path, timing: Timing) -> None:
    fps = Fraction(video.get("avg_frame_rate", "0/1"))
    frames = int(video.get("nb_frames", 0))
    duration = float(video.get("duration", 0))
    expected_frames = round(timing.duration_seconds * timing.fps)
    if (video.get("width"), video.get("height")) != (1920, 1080):
        raise ValueError(f"{path} must be 1920×1080")
    if fps != timing.fps or frames != expected_frames:
        raise ValueError(
            f"{path} must be {timing.fps} fps and {expected_frames} frames; "
            f"found {fps} fps and {frames} frames"
        )
    if abs(duration - timing.duration_seconds) > 1 / timing.fps:
        raise ValueError(f"{path} duration is {duration:.6f}s, expected {timing.duration_seconds:.6f}s")


def validate_rendered(
    prores_path: Path,
    timing: Timing,
    wav_path: Path = SOURCE_WAV,
    encoded_path: Path | None = None,
) -> None:
    prores_probe = _probe(prores_path)
    prores_video = _video_stream(prores_probe, prores_path)
    prores_audio = _audio_stream(prores_probe, prores_path)
    _check_video(prores_video, prores_path, timing)

    if int(prores_audio.get("sample_rate", 0)) != timing.sample_rate:
        raise ValueError(f"{prores_path} audio sample rate does not match stinger.wav")
    if int(prores_audio.get("channels", 0)) != timing.channels:
        raise ValueError(f"{prores_path} audio channel count does not match stinger.wav")

    with wave.open(str(wav_path), "rb") as wav:
        source_pcm = wav.readframes(wav.getnframes())
    decoded = subprocess.run(
        [
            "ffmpeg", "-v", "error", "-i", str(prores_path), "-map", "0:a:0",
            "-ar", str(timing.sample_rate), "-ac", str(timing.channels),
            "-f", "s16le", "-acodec", "pcm_s16le", "pipe:1",
        ],
        check=True,
        capture_output=True,
    ).stdout
    if (timing.delay_frames * timing.sample_rate) % timing.fps:
        raise ValueError("the stinger frame delay does not land on a whole WAV sample")
    _find_embedded_pcm_start(decoded, source_pcm, timing, str(prores_path))

    if encoded_path:
        encoded_probe = _probe(encoded_path)
        encoded_video = _video_stream(encoded_probe, encoded_path)
        _check_video(encoded_video, encoded_path, timing)
        if encoded_video.get("codec_name") != "hevc" or encoded_video.get("codec_tag_string") != "hvc1":
            raise ValueError(f"{encoded_path} must be HEVC in an hvc1 QuickTime stream")
        encoded_audio = _audio_stream(encoded_probe, encoded_path)
        if int(encoded_audio.get("sample_rate", 0)) != timing.sample_rate:
            raise ValueError(f"{encoded_path} audio sample rate does not match stinger.wav")
        if int(encoded_audio.get("channels", 0)) != timing.channels:
            raise ValueError(f"{encoded_path} audio channel count does not match stinger.wav")
        encoded_pcm = subprocess.run(
            [
                "ffmpeg", "-v", "error", "-i", str(encoded_path), "-map", "0:a:0",
                "-ar", str(timing.sample_rate), "-ac", str(timing.channels),
                "-f", "s16le", "-acodec", "pcm_s16le", "pipe:1",
            ],
            check=True,
            capture_output=True,
        ).stdout
        _find_embedded_pcm_start(encoded_pcm, source_pcm, timing, str(encoded_path))
        validate_hevc_alpha(encoded_path, cover_time_ms=timing.point_ms)

    print(
        f"✓ Stinger render: {timing.fps} fps × {round(timing.fps * timing.duration_seconds)} frames; "
        f"WAV peak at {timing.wav_peak_seconds * 1000:.3f} ms lands within one frame of "
        f"the {timing.point_ms} ms cut point; embedded PCM is byte-for-byte intact."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rendered", type=Path, help="rendered ProRes stinger.mov")
    parser.add_argument("--encoded", type=Path, help="transcoded HEVC-alpha stinger-hevc.mov")
    parser.add_argument(
        "--alpha-file", action="append", type=Path, default=[],
        help="additional HEVC-alpha overlay to verify; may be repeated",
    )
    parser.add_argument("--wav", type=Path, default=SOURCE_WAV)
    args = parser.parse_args()

    try:
        timing = read_timing(wav_path=args.wav)
        if args.encoded and not args.rendered:
            raise ValueError("--encoded requires --rendered")
        if args.rendered:
            validate_rendered(args.rendered, timing, wav_path=args.wav, encoded_path=args.encoded)
        for alpha_file in args.alpha_file:
            validate_hevc_alpha(alpha_file)
        if not args.rendered:
            print(
                f"✓ Stinger timing: {timing.sample_rate} Hz, {timing.channels} channels, "
                f"{timing.wav_frames / timing.sample_rate:.6f}s; measured peak "
                f"{timing.wav_peak_seconds * 1000:.3f} ms; delay {timing.delay_frames} frames; "
                f"cut point {timing.point_ms} ms."
            )
    except (OSError, ValueError, wave.Error, subprocess.CalledProcessError, json.JSONDecodeError) as error:
        print(f"stinger validation failed: {error}", file=__import__("sys").stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
