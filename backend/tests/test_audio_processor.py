"""
Unit Tests for AudioBuffer, Rolling Window, and RMS Voice Activity Detection
"""
import pytest
import numpy as np
from app.ai.audio_buffer import AudioBuffer


def test_pcm_int16_to_float32_conversion():
    buffer = AudioBuffer(target_sample_rate=16000, max_duration_seconds=5.0)

    # Synthetic int16 sine wave at 440Hz
    t = np.linspace(0, 1.0, 16000, endpoint=False)
    sine_wave = (np.sin(2 * np.pi * 440 * t) * 30000).astype(np.int16)
    pcm_bytes = sine_wave.tobytes()

    samples_appended = buffer.append_pcm_bytes(pcm_bytes)
    assert samples_appended == 16000
    assert len(buffer.buffer) == 16000
    # Values should be normalized between -1.0 and 1.0
    assert np.all(buffer.buffer >= -1.0)
    assert np.all(buffer.buffer <= 1.0)


def test_voice_activity_detection_silence_vs_speech():
    buffer = AudioBuffer(target_sample_rate=16000, silence_threshold_rms=0.012)

    # 1. Pure silence (all zeros)
    silence = np.zeros(8000, dtype=np.int16).tobytes()
    buffer.append_pcm_bytes(silence)
    assert buffer.is_speech_active() is False

    # 2. Active speech simulation (audible audio amplitude)
    t = np.linspace(0, 0.5, 8000, endpoint=False)
    active_audio = (np.sin(2 * np.pi * 300 * t) * 20000).astype(np.int16).tobytes()
    buffer.append_pcm_bytes(active_audio)
    assert buffer.is_speech_active() is True


def test_rolling_window_trimming():
    max_duration = 3.0  # 3 seconds max = 48,000 samples
    buffer = AudioBuffer(target_sample_rate=16000, max_duration_seconds=max_duration)

    # Append 5 seconds of audio (80,000 samples)
    five_sec = np.ones(80000, dtype=np.int16).tobytes()
    buffer.append_pcm_bytes(five_sec)

    # Buffer should automatically cap at max_samples (48,000)
    assert len(buffer.buffer) == 48000
    assert buffer.get_duration_seconds() == 3.0


def test_get_recent_audio_extraction():
    buffer = AudioBuffer(target_sample_rate=16000, max_duration_seconds=6.0)

    audio = np.arange(32000, dtype=np.int16).tobytes()
    buffer.append_pcm_bytes(audio)

    # Extract recent 1 second (16,000 samples)
    recent = buffer.get_recent_audio(duration_seconds=1.0)
    assert len(recent) == 16000
