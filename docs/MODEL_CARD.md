# Quran Companion AI — Model Card: Whisper Base Arabic Quran

## 1. Model Summary
- **Model Name**: `tarteel-ai/whisper-base-ar-quran`
- **Architecture**: OpenAI Whisper Base Encoder-Decoder Transformer
- **Parameters**: ~74M parameters
- **Source**: [Hugging Face Hub](https://huggingface.co/tarteel-ai/whisper-base-ar-quran)
- **Primary Domain**: Automatic Speech Recognition (ASR) fine-tuned for Classical Quranic Arabic recitation.

---

## 2. Hardware Requirements & Performance

| Hardware Configuration | Inference Latency (3s Chunk) | Memory Footprint | Recommended Use |
| :--- | :--- | :--- | :--- |
| **NVIDIA GPU (CUDA, FP16)** | ~180ms - 350ms | ~1.2 GB VRAM | Production Server |
| **Modern Multi-core CPU** | ~650ms - 1200ms | ~1.8 GB RAM | Development & Local Test |
| **Deterministic Mock Mode** | < 5ms | ~50 MB RAM | CI / Automated Unit Tests |

---

## 3. Scope & Critical Limitations
- **Word-Level ASR**: The model reliably decodes spoken Arabic words into corresponding graphemes.
- **Tajweed & Phonetic Limitations**: General ASR does not classify acoustic tajweed rules (madd duration, ikhfa nasalization, qalqalah resonance, ghunnah).
- **Misrecitation Detection**: The application flags word-level differences as **potential** discrepancies rather than dogmatic pronouncements.
