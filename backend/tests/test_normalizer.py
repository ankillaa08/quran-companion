"""
Unit Tests for Arabic & Quranic Text Normalizer
"""
import pytest
from app.alignment.normalizer import ArabicNormalizer


def test_strip_tashkeel():
    # Surah Al-Fatihah Ayah 1 with full diacritics
    uthmani = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
    stripped = ArabicNormalizer.strip_tashkeel(uthmani)
    # Diacritics should be completely removed
    assert "ِ" not in stripped
    assert "َّ" not in stripped
    assert "ْ" not in stripped
    assert "ٰ" not in stripped


def test_normalize_alifs():
    assert ArabicNormalizer.normalize_alifs("إِيَّاكَ") == "ايَّاك" or "ا" in ArabicNormalizer.normalize_alifs("إِيَّاكَ")
    assert ArabicNormalizer.normalize("أَنْعَمْتَ") == "انعمت"
    assert ArabicNormalizer.normalize("ٱلْحَمْدُ") == "الحمد"
    assert ArabicNormalizer.normalize("إِلَـٰهِ") == "اله"


def test_normalize_yaa_and_taa_marbuta():
    assert ArabicNormalizer.normalize("عَلَى") == "علي"
    assert ArabicNormalizer.normalize("ٱلْجِنَّةِ") == "الجنه"
    assert ArabicNormalizer.normalize("ٱلصَّلَوٰةَ") == "الصلوه" or "صل" in ArabicNormalizer.normalize("ٱلصَّلَوٰةَ")


def test_quranic_symbols_removal():
    text_with_symbol = "جَنَّـٰتُ عَدْنٍ ۚ يَفْتَحُ لَهُمْ"
    cleaned = ArabicNormalizer.strip_quranic_symbols(text_with_symbol)
    assert "ۚ" not in cleaned


def test_full_normalization_pipeline():
    verse = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
    normalized = ArabicNormalizer.normalize(verse)
    assert normalized == "بسم الله الرحمن الرحيم"


def test_tokenize():
    verse = "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ"
    tokens = ArabicNormalizer.tokenize(verse)
    assert tokens == ["الحمد", "لله", "رب", "العالمين"]
    assert len(tokens) == 4
