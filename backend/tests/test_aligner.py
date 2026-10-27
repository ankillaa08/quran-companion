"""
Unit Tests for Quran Word Alignment & Mistake Detection Engine
"""
import pytest
from app.alignment.aligner import QuranWordAligner
from app.data.verses import get_ayah


@pytest.fixture
def aligner():
    return QuranWordAligner()


@pytest.fixture
def fatihah_ayah_1():
    # Surah 1: Ayah 1 (بسم الله الرحمن الرحيم)
    return get_ayah(1, 1)["words"]


@pytest.fixture
def fatihah_ayah_2():
    # Surah 1: Ayah 2 (الحمد لله رب العالمين)
    return get_ayah(1, 2)["words"]


def test_exact_recitation_alignment(aligner, fatihah_ayah_1):
    recited = "بسم الله الرحمن الرحيم"
    res = aligner.align_verse(expected_words=fatihah_ayah_1, recognized_text=recited)

    assert res["is_verse_completed"] is True
    assert len(res["matched_positions"]) == 4
    assert res["confidence"] >= 0.95
    assert len(res["mistakes"]) == 0


def test_partial_streaming_alignment(aligner, fatihah_ayah_1):
    # User recited only first two words
    recited = "بسم الله"
    res = aligner.align_verse(expected_words=fatihah_ayah_1, recognized_text=recited)

    assert res["is_verse_completed"] is False
    assert res["matched_positions"] == [1, 2]
    assert res["aligned_words"][0]["status"] == "matched"
    assert res["aligned_words"][1]["status"] == "matched"
    assert res["aligned_words"][2]["status"] == "pending"


def test_omission_detection(aligner, fatihah_ayah_2):
    # Expected: "الحمد لله رب العالمين"
    # Recited: "الحمد لله العالمين" (omitted "رب")
    recited = "الحمد لله العالمين"
    res = aligner.align_verse(expected_words=fatihah_ayah_2, recognized_text=recited)

    # Should detect omission of position 3 ("رب")
    omissions = [m for m in res["mistakes"] if m["type"] == "omission"]
    assert len(omissions) == 1
    assert omissions[0]["position"] == 3


def test_substitution_detection(aligner, fatihah_ayah_1):
    # Expected: "بسم الله الرحمن الرحيم"
    # Recited: "بسم الله العزيز الرحيم" (substituted "العزيز" for "الرحمن")
    recited = "بسم الله العزيز الرحيم"
    res = aligner.align_verse(expected_words=fatihah_ayah_1, recognized_text=recited)

    substitutions = [m for m in res["mistakes"] if m["type"] == "substitution"]
    assert len(substitutions) == 1
    assert substitutions[0]["position"] == 3


def test_repetition_detection(aligner, fatihah_ayah_1):
    # Recited: "بسم الله الله الرحمن الرحيم" (repeated "الله")
    recited = "بسم الله الله الرحمن الرحيم"
    res = aligner.align_verse(expected_words=fatihah_ayah_1, recognized_text=recited)

    repetitions = [m for m in res["mistakes"] if m["type"] == "repetition"]
    assert len(repetitions) >= 1
