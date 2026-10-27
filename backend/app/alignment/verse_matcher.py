"""
Verse Identification & Recitation Progression Matcher
Finds the active Surah & Ayah based on recognized spoken text, and detects
seamless transitions to subsequent verses.
"""
from typing import List, Dict, Any, Optional, Tuple
from difflib import SequenceMatcher
from app.alignment.normalizer import ArabicNormalizer
from app.data.verses import AUTHENTIC_VERSES, get_surah_ayahs


class VerseMatcher:
    def __init__(self, normalizer: Optional[ArabicNormalizer] = None):
        self.normalizer = normalizer or ArabicNormalizer()

    def find_best_ayah_match(
        self,
        recognized_text: str,
        surah_hint: Optional[int] = None
    ) -> Optional[Tuple[int, int, float]]:
        """
        Scans verses to identify which surah and ayah is being recited.
        Returns: (surah_number, ayah_number, confidence_score) or None.
        """
        norm_recited = self.normalizer.normalize(recognized_text)
        if not norm_recited or len(norm_recited.split()) < 2:
            return None

        best_match = None
        highest_score = 0.0

        surahs_to_check = [surah_hint] if surah_hint and surah_hint in AUTHENTIC_VERSES else list(AUTHENTIC_VERSES.keys())

        for s_num in surahs_to_check:
            ayahs = AUTHENTIC_VERSES[s_num]
            for a in ayahs:
                norm_ayah = self.normalizer.normalize(a["text_clean"])
                
                # Check substring match or sequence similarity
                if norm_recited in norm_ayah:
                    score = len(norm_recited) / len(norm_ayah)
                    score = min(score + 0.3, 1.0)
                else:
                    score = SequenceMatcher(None, norm_recited, norm_ayah).ratio()

                if score > highest_score and score >= 0.55:
                    highest_score = score
                    best_match = (s_num, a["ayah"], round(score, 2))

        return best_match

    def check_next_ayah_transition(
        self,
        current_surah: int,
        current_ayah: int,
        recognized_text: str
    ) -> Optional[int]:
        """
        Checks if the reciter has transitioned into reciting the next ayah.
        Returns the new ayah number if transitioned, else None.
        """
        ayahs = get_surah_ayahs(current_surah)
        next_ayah_num = current_ayah + 1
        next_ayah = next((a for a in ayahs if a["ayah"] == next_ayah_num), None)

        if not next_ayah:
            return None

        norm_recited = self.normalizer.normalize(recognized_text)
        norm_next = self.normalizer.normalize(next_ayah.get("text_clean", ""))

        # Check first 2-3 words of next ayah
        first_tokens_next = " ".join(norm_next.split()[:3])
        if first_tokens_next and first_tokens_next in norm_recited:
            return next_ayah_num

        sim = SequenceMatcher(None, norm_recited, norm_next).ratio()
        if sim >= 0.6:
            return next_ayah_num

        return None
