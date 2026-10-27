"""
Quran Word Alignment Engine
Aligns streaming speech-to-text words against expected Quranic verse words using
dynamic programming and phonetic similarity metrics.
"""
from typing import List, Dict, Any, Tuple, Optional
from difflib import SequenceMatcher
from app.alignment.normalizer import ArabicNormalizer


def token_similarity(a: str, b: str) -> float:
    """Computes similarity ratio between two normalized Arabic words."""
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    return SequenceMatcher(None, a, b).ratio()


class QuranWordAligner:
    def __init__(self, match_threshold: float = 0.75):
        self.match_threshold = match_threshold
        self.normalizer = ArabicNormalizer

    def align_verse(
        self,
        expected_words: List[Dict[str, Any]],
        recognized_text: str,
        start_expected_idx: int = 0
    ) -> Dict[str, Any]:
        """
        Aligns recognized spoken words against expected verse words.

        expected_words: List of word dicts with "position", "text_uthmani", "text_clean".
        recognized_text: Raw or partial transcription from ASR.
        start_expected_idx: Index of next expected word to match.

        Returns alignment results with matched indices, current word pointer,
        detected mistakes, and overall confidence.
        """
        recited_tokens = self.normalizer.tokenize(recognized_text)
        if not recited_tokens or not expected_words:
            return {
                "matched_positions": [],
                "current_word_index": start_expected_idx,
                "aligned_words": [
                    {
                        "position": w.get("position", idx + 1),
                        "text_uthmani": w.get("text_uthmani", ""),
                        "text_clean": w.get("text_clean", ""),
                        "status": "pending",
                        "similarity": 0.0
                    }
                    for idx, w in enumerate(expected_words)
                ],
                "confidence": 0.0,
                "is_verse_completed": False,
                "mistakes": []
            }

        num_expected = len(expected_words)
        aligned_status = ["pending"] * num_expected
        word_sims = [0.0] * num_expected
        matched_positions = []
        mistakes = []

        exp_idx = start_expected_idx
        rec_idx = 0

        while rec_idx < len(recited_tokens) and exp_idx < num_expected:
            rec_word = recited_tokens[rec_idx]
            exp_word_clean = expected_words[exp_idx].get("text_clean") or expected_words[exp_idx].get("text_uthmani", "")
            exp_norm = self.normalizer.normalize(exp_word_clean)

            sim = token_similarity(rec_word, exp_norm)

            if sim >= self.match_threshold:
                # Direct Match
                aligned_status[exp_idx] = "matched"
                word_sims[exp_idx] = sim
                matched_positions.append(expected_words[exp_idx].get("position", exp_idx + 1))
                exp_idx += 1
                rec_idx += 1
            else:
                # Check for potential omission: user skipped current expected word and matched the next one?
                next_matched = False
                if exp_idx + 1 < num_expected:
                    next_exp_clean = expected_words[exp_idx + 1].get("text_clean") or expected_words[exp_idx + 1].get("text_uthmani", "")
                    next_norm = self.normalizer.normalize(next_exp_clean)
                    next_sim = token_similarity(rec_word, next_norm)
                    if next_sim >= self.match_threshold:
                        # User omitted expected_words[exp_idx]
                        mistakes.append({
                            "type": "omission",
                            "expected_word": exp_norm,
                            "expected_word_uthmani": expected_words[exp_idx].get("text_uthmani", ""),
                            "position": expected_words[exp_idx].get("position", exp_idx + 1),
                            "confidence": 0.85
                        })
                        aligned_status[exp_idx] = "omitted"
                        aligned_status[exp_idx + 1] = "matched"
                        word_sims[exp_idx + 1] = next_sim
                        matched_positions.append(expected_words[exp_idx + 1].get("position", exp_idx + 2))
                        exp_idx += 2
                        rec_idx += 1
                        next_matched = True

                if not next_matched:
                    # Check for repetition: user repeated previous word?
                    if exp_idx > 0:
                        prev_exp_clean = expected_words[exp_idx - 1].get("text_clean") or expected_words[exp_idx - 1].get("text_uthmani", "")
                        prev_norm = self.normalizer.normalize(prev_exp_clean)
                        prev_sim = token_similarity(rec_word, prev_norm)
                        if prev_sim >= self.match_threshold:
                            mistakes.append({
                                "type": "repetition",
                                "recited_word": rec_word,
                                "expected_word": prev_norm,
                                "position": expected_words[exp_idx - 1].get("position", exp_idx),
                                "confidence": 0.80
                            })
                            rec_idx += 1
                            continue

                    # Check if next word matches next expected word (contextual substitution)
                    is_contextual_sub = False
                    if rec_idx + 1 < len(recited_tokens) and exp_idx + 1 < num_expected:
                        next_exp_clean = expected_words[exp_idx + 1].get("text_clean") or expected_words[exp_idx + 1].get("text_uthmani", "")
                        next_norm = self.normalizer.normalize(next_exp_clean)
                        next_sim = token_similarity(recited_tokens[rec_idx + 1], next_norm)
                        if next_sim >= self.match_threshold:
                            is_contextual_sub = True

                    # Substitution or Insertion
                    if sim >= 0.4 or is_contextual_sub:
                        # Probable substitution
                        mistakes.append({
                            "type": "substitution",
                            "recited_word": rec_word,
                            "expected_word": exp_norm,
                            "expected_word_uthmani": expected_words[exp_idx].get("text_uthmani", ""),
                            "position": expected_words[exp_idx].get("position", exp_idx + 1),
                            "confidence": round(1.0 - sim, 2)
                        })
                        aligned_status[exp_idx] = "substituted"
                        word_sims[exp_idx] = sim
                        exp_idx += 1
                        rec_idx += 1
                    else:
                        # Unrecognized extra word (insertion)
                        mistakes.append({
                            "type": "insertion",
                            "recited_word": rec_word,
                            "expected_position": exp_idx + 1,
                            "confidence": 0.70
                        })
                        rec_idx += 1

        # Check if completed
        is_completed = (exp_idx >= num_expected) or (len(matched_positions) >= num_expected * 0.85)

        # Build output structure
        aligned_words = []
        for i, w in enumerate(expected_words):
            status = aligned_status[i]
            aligned_words.append({
                "position": w.get("position", i + 1),
                "text_uthmani": w.get("text_uthmani", ""),
                "text_clean": w.get("text_clean", ""),
                "status": status,
                "similarity": round(word_sims[i], 2)
            })

        avg_conf = (sum(word_sims) / len(word_sims)) if word_sims else 0.0

        return {
            "matched_positions": matched_positions,
            "current_word_index": min(exp_idx, num_expected - 1),
            "aligned_words": aligned_words,
            "confidence": round(avg_conf, 2),
            "is_verse_completed": is_completed,
            "mistakes": mistakes
        }
