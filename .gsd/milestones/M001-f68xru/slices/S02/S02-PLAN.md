# S02: Voice Silence Auto-Stop

**Goal:** Add silence detection to VoiceRecorder using Web Audio API AnalyserNode, auto-stopping recording after 1.5s of silence.
**Demo:** Start recording, speak, stop speaking — recording auto-stops after 1.5s of silence, transcription fires. Hold-to-release still works.

## Must-Haves
- Web Audio API AnalyserNode monitors audio levels during recording
- Recording auto-stops after 1.5 seconds of continuous silence
- Hold-to-record (mouseUp/touchEnd) still stops recording immediately
- Silence threshold is tuned to avoid false positives with normal background noise
- No new npm dependencies
- Recording pulse animation still works during recording
- Timer display still works during recording

## Tasks

- [ ] **T01: Silence detection in VoiceRecorder**
  Add Web Audio API AnalyserNode to VoiceRecorder, implement silence detection with 1.5s threshold, auto-stop recording.

## Files Likely Touched
- components/voice/VoiceRecorder.tsx
