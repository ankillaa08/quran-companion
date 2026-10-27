"""
Quran Reader & Text API Endpoints
Provides navigation for 114 Surahs, authentic Uthmani verses, word tokens, and search.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.data.surahs import SURAHS, get_surah_by_number
from app.data.verses import get_surah_ayahs, get_ayah, AUTHENTIC_VERSES
from app.alignment.normalizer import ArabicNormalizer

router = APIRouter(prefix="/quran", tags=["Quran Reader"])


@router.get("/surahs")
def list_surahs(q: Optional[str] = Query(None, description="Search by name in English or Arabic")):
    if not q:
        return SURAHS

    q_lower = q.lower().strip()
    q_norm = ArabicNormalizer.normalize(q)

    results = []
    for s in SURAHS:
        s_norm_ar = ArabicNormalizer.normalize(s["name_ar"])
        if (q_lower in s["name_en"].lower() or 
            q_lower in s["name_translation"].lower() or 
            q_norm in s_norm_ar or 
            q.strip() == str(s["number"])):
            results.append(s)
    return results


@router.get("/surahs/{surah_number}")
def get_surah_details(surah_number: int):
    surah = get_surah_by_number(surah_number)
    if not surah:
        raise HTTPException(status_code=404, detail=f"Surah {surah_number} not found")

    ayahs = get_surah_ayahs(surah_number)
    return {
        "metadata": surah,
        "ayahs": ayahs
    }


@router.get("/ayahs/{surah_number}/{ayah_number}")
def get_specific_ayah(surah_number: int, ayah_number: int):
    ayah = get_ayah(surah_number, ayah_number)
    if not ayah:
        raise HTTPException(status_code=404, detail=f"Ayah {surah_number}:{ayah_number} not found")
    return ayah


@router.get("/search")
def search_quran(q: str = Query(..., min_length=2, description="Search query")):
    q_clean = ArabicNormalizer.normalize(q)
    q_lower = q.lower()
    matches = []

    for surah_num, ayahs in AUTHENTIC_VERSES.items():
        surah_meta = get_surah_by_number(surah_num)
        for a in ayahs:
            norm_ayah = ArabicNormalizer.normalize(a["text_clean"])
            if q_clean in norm_ayah or q_lower in a["translation_en"].lower():
                matches.append({
                    "surah_number": surah_num,
                    "surah_name_ar": surah_meta["name_ar"] if surah_meta else "",
                    "surah_name_en": surah_meta["name_en"] if surah_meta else "",
                    "ayah_number": a["ayah"],
                    "text_uthmani": a["text_uthmani"],
                    "translation_en": a["translation_en"]
                })

    return {
        "query": q,
        "total_results": len(matches),
        "results": matches[:50]
    }
