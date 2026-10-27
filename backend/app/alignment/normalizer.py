"""
Arabic & Quranic Text Normalizer
Normalizes Quranic Arabic orthography, strips diacritics/harakat, handles Quranic
pause symbols, and normalizes letter forms for resilient speech-to-text alignment.
"""
import re
import unicodedata
from typing import List

# Arabic Tashkeel / Harakat Unicode Range (0x064B to 0x065F, 0x0670)
TASHKEEL_RE = re.compile(
    r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08E3-\u08FF]"
)

# Quranic Pause and Recitation Symbols
QURANIC_SYMBOLS_RE = re.compile(
    r"[\u06D6\u06D7\u06D8\u06D9\u06DA\u06DB\u06DC\u06DD\u06DE\u06DF"
    r"\u06E0\u06E1\u06E2\u06E3\u06E4\u06E5\u06E6\u06E7\u06E8\u06E9\u06EA\u06EB\u06EC\u06ED]"
)

# Tatweel / Kashida
TATWEEL_RE = re.compile(r"\u0640")

# Alif variants
ALIF_VARIANTS_RE = re.compile(r"[\u0622\u0623\u0625\u0671]")  # آ, أ, إ, ٱ -> ا


class ArabicNormalizer:
    @staticmethod
    def strip_tashkeel(text: str) -> str:
        """Removes all Arabic diacritical marks (fathah, kasrah, dammah, sukun, shaddah, tanween, dagger alif)."""
        if not text:
            return ""
        return TASHKEEL_RE.sub("", text)

    @staticmethod
    def strip_quranic_symbols(text: str) -> str:
        """Removes Quranic recitation symbols, pause marks, and sajda/ruku markers."""
        if not text:
            return ""
        return QURANIC_SYMBOLS_RE.sub("", text)

    @staticmethod
    def strip_tatweel(text: str) -> str:
        """Removes tatweel / kashida (ـ)."""
        if not text:
            return ""
        return TATWEEL_RE.sub("", text)

    @staticmethod
    def normalize_alifs(text: str) -> str:
        """Normalizes all forms of Alif (أ, إ, آ, ٱ) into standard bare Alif (ا)."""
        if not text:
            return ""
        return ALIF_VARIANTS_RE.sub("\u0627", text)

    @staticmethod
    def normalize_yaa(text: str) -> str:
        """Normalizes Alif Maqsura (ى) to Yaa (ي)."""
        if not text:
            return ""
        return text.replace("\u0649", "\u064A")

    @staticmethod
    def normalize_taa_marbuta(text: str) -> str:
        """Normalizes Taa Marbuta (ة) to Haa (ه)."""
        if not text:
            return ""
        return text.replace("\u0629", "\u0647")

    @staticmethod
    def remove_punctuation(text: str) -> str:
        """Strips Arabic and Western punctuation and digits."""
        if not text:
            return ""
        # Keep Arabic letters, spaces, and Western letters
        cleaned = re.sub(r"[^\w\s]", " ", text)
        cleaned = re.sub(r"[\d\u0660-\u0669]", " ", cleaned)
        return cleaned

    @classmethod
    def normalize(
        cls,
        text: str,
        strip_harakat: bool = True,
        normalize_alif: bool = True,
        normalize_y: bool = True,
        normalize_h: bool = True,
        clean_punct: bool = True
    ) -> str:
        """
        Full text normalization pipeline for comparison and alignment.
        """
        if not text:
            return ""

        # Normalize unicode decomposition (NFKC)
        normalized = unicodedata.normalize("NFKC", text)

        # Normalize dagger alifs into standard Alif where appropriate
        normalized = normalized.replace("الرَّحْمَـٰنِ", "الرحمن").replace("ٱلرَّحْمَـٰنِ", "الرحمن")
        normalized = normalized.replace("الرَّحْمَـٰنُ", "الرحمن").replace("ٱلرَّحْمَـٰنُ", "الرحمن")
        normalized = normalized.replace("الرَّحْمَٰنِ", "الرحمن").replace("ٱلرَّحْمَٰنِ", "الرحمن")
        normalized = normalized.replace("إِلَـٰهِ", "إله").replace("إِلَـٰهَ", "إله").replace("إِلَـٰهٌ", "إله")
        normalized = normalized.replace("إِلَٰهِ", "إله").replace("إِلَٰهَ", "إله").replace("إِلَٰهٌ", "إله")
        normalized = normalized.replace("\u0640\u0670", "\u0627").replace("\u0670", "\u0627")

        # Remove tatweel and pause symbols
        normalized = cls.strip_tatweel(normalized)
        normalized = cls.strip_quranic_symbols(normalized)

        if strip_harakat:
            normalized = cls.strip_tashkeel(normalized)

        if normalize_alif:
            normalized = cls.normalize_alifs(normalized)

        if normalize_y:
            normalized = cls.normalize_yaa(normalized)

        if normalize_h:
            normalized = cls.normalize_taa_marbuta(normalized)

        if clean_punct:
            normalized = cls.remove_punctuation(normalized)

        # Collapse whitespace
        normalized = re.sub(r"\s+", " ", normalized).strip()

        # Standardize classical Quranic contractions
        normalized = normalized.replace("الرحمان", "الرحمن").replace("إلاه", "إله")
        return normalized

    @classmethod
    def tokenize(cls, text: str, normalize_tokens: bool = True) -> List[str]:
        """Splits Arabic text into word tokens, optionally normalized."""
        if not text:
            return []
        if normalize_tokens:
            cleaned = cls.normalize(text)
        else:
            cleaned = text.strip()
        return [tok for tok in cleaned.split() if tok]
