"""
Rolling Audio Buffer & Voice Activity Detection (VAD)
Manages streaming PCM audio chunks, rolling context windows, and silence detection.
"""
import io
import math
import numpy as np
from typing import Optional, Tuple


class AudioBuffer:
    def __init__(
        self,
        target_sample_rate: int = 16000,
        max_duration_seconds: float = 6.0,
        silence_threshold_rms: float = 0.012
    ):
        self.sample_rate = target_sample_rate
        self.max_samples = int(target_sample_rate * max_duration_seconds)
        self.silence_threshold = silence_threshold_rms
        self.buffer = np.zeros(0, dtype=np.float32)
        self.total_samples_received = 0

    def append_pcm_bytes(self, pcm_data: bytes) -> int:
        """
        Appends raw 16-bit signed integer mono PCM audio bytes.
        Converts to normalized float32 in range [-1.0, 1.0].
        """
        if not pcm_data:
            return 0

        # Convert int16 bytes to numpy array
        int16_samples = np.frombuffer(pcm_data, dtype=np.int16)
        if len(int16_samples) == 0:
            return 0

        float_samples = int16_samples.astype(np.float32) / 32768.0

        # Append to buffer
        self.buffer = np.append(self.buffer, float_samples)
        self.total_samples_received += len(float_samples)

        # Enforce max duration by trimming older samples
        if len(self.buffer) > self.max_samples:
            self.buffer = self.buffer[-self.max_samples:]

        return len(float_samples)

    def is_speech_active(self, window_seconds: float = 0.5) -> bool:
        """
        Calculates Root-Mean-Square (RMS) energy over recent samples to determine speech activity.
        """
        if len(self.buffer) == 0:
            return False

        samples_to_check = min(len(self.buffer), int(self.sample_rate * window_seconds))
        recent_chunk = self.buffer[-samples_to_check:]
        rms = float(np.sqrt(np.mean(recent_chunk ** 2)))

        return rms >= self.silence_threshold

    def get_recent_audio(self, duration_seconds: float = 3.0) -> np.ndarray:
        """
        Extracts recent audio up to specified duration for inference.
        """
        samples_needed = int(self.sample_rate * duration_seconds)
        if len(self.buffer) <= samples_needed:
            return self.buffer.copy()
        return self.buffer[-samples_needed:].copy()

    def get_duration_seconds(self) -> float:
        """Returns total current buffered audio duration in seconds."""
        return len(self.buffer) / self.sample_rate

    def clear(self):
        """Resets the audio buffer."""
        self.buffer = np.zeros(0, dtype=np.float32)
        self.total_samples_received = 0
