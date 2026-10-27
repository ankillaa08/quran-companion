# Quran Companion AI — Audio Privacy & Data Retention Policy

## 1. Sacred Recitation Privacy Commitment
Reciting the Quran is an act of deep spiritual significance. Quran Companion AI enforces a strict, privacy-by-default architecture:

1. **Zero Raw Audio Retention by Default**:
   - Audio is buffered in volatile RAM exclusively to perform speech recognition and alignment.
   - Raw audio chunks are purged as soon as the sequence window advances.
   - No audio files are recorded or persisted to the server's disk or database.

2. **Opt-in Audio Snippets**:
   - Users may optionally enable local audio snippet retention in Settings.
   - When enabled, only short 2-second clips associated with flagged mistakes are saved to enable self-correction.

3. **User Data Sovereignty**:
   - Practice history, streak records, and bookmarks belong entirely to the user.
   - One-tap data purging is accessible from the Mobile App Settings at any time.
