# Quran Companion AI — Datasets & Text Provenance

## 1. Verified Quranic Text
- **Source**: [Tanzil Project](https://tanzil.net/download)
- **Format**: Tanzil Uthmani Text with diacritics & Tanzil Clean Arabic text.
- **Licence & Attribution**: Tanzil Quran text is provided under the Tanzil Terms of Use. Quran Companion AI preserves textual integrity and never modifies or synthesizes Quranic scripture.
- **Coverage**: All 114 Surahs and 6,236 Ayahs.

---

## 2. Audio Datasets for Evaluation & Benchmarking

### EveryAyah Audio Corpus
- **Dataset Link**: [Hugging Face EveryAyah](https://huggingface.co/datasets/tarteel-ai/everyayah)
- **Description**: Verse-level recorded recitations from renowned Qaris (Mishary Rashid Alafasy, Abdul Basit, Mahmoud Khalil Al-Husary, Saad Al-Ghamdi).
- **Use Case**: Used for offline Word Error Rate (WER) benchmarking, segmentation evaluation, and automated alignment verification.
- **Licence**: Attribution required per reciter recordings.

### OpenSLR Quran Speech Corpus (SLR132)
- **Link**: [OpenSLR SLR132](https://openslr.org/132/)
- **Description**: Multi-speaker Quran speech dataset used for acoustic cross-validation across accents and reciters.

---

## 3. Local Dataset Handling Instructions
In accordance with production repository best practices:
- Raw audio files (`.wav`, `.mp3`) are not committed to Git source control.
- Cache audio files in `data/downloads/` or S3/GCS buckets.
