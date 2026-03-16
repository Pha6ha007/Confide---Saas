# T01: Silence Detection in VoiceRecorder

**Slice:** S02
**Milestone:** M001-f68xru

## Goal
Add Web Audio API AnalyserNode to VoiceRecorder for silence detection, auto-stopping recording after 1.5s of continuous silence.

## Must-Haves

### Truths
- Recording auto-stops after 1.5s of continuous silence
- Hold-to-release (mouseUp/touchEnd) still stops recording immediately
- Recording duration timer still increments correctly during recording
- Pulse animation still plays during recording
- Cleanup on unmount releases AudioContext and AnalyserNode resources

### Artifacts
- `components/voice/VoiceRecorder.tsx` — Updated with silence detection (added ~50-80 lines for AnalyserNode setup and monitoring loop)

### Key Links
- VoiceRecorder → Web Audio API via `new AudioContext()` and `audioContext.createAnalyser()`
- VoiceRecorder → MediaStream via `audioContext.createMediaStreamSource(stream)`
- Silence detection loop → `stopRecording()` via timeout after 1.5s below threshold

## Steps
1. Read current VoiceRecorder.tsx to understand refs and lifecycle
2. In `startRecording()`: create AudioContext, create AnalyserNode from the MediaStream
3. Configure AnalyserNode: fftSize=2048, smoothingTimeConstant=0.8
4. Start a monitoring loop (requestAnimationFrame or setInterval ~100ms) that:
   - Gets frequency data via getByteFrequencyData()
   - Computes RMS (root mean square) of the frequency data
   - If RMS < silence threshold: start/continue silence timer
   - If RMS >= silence threshold: reset silence timer
   - If silence timer >= 1.5s: call stopRecording()
5. Store AudioContext and AnalyserNode in refs for cleanup
6. In `stopRecording()`: cancel the monitoring loop, close AudioContext
7. In cleanup useEffect: ensure AudioContext is closed on unmount
8. Update status text to show "Listening..." instead of just "Recording..." to indicate auto-stop capability
9. Verify TypeScript compiles cleanly

## Context
- Current VoiceRecorder uses hold-to-record: mouseDown starts, mouseUp stops
- MediaRecorder and MediaStream are already created in startRecording()
- The stream ref (streamRef) holds the MediaStream — we can create AudioContext source from it
- AnalyserNode.getByteFrequencyData() returns Uint8Array of frequency bin magnitudes (0-255)
- RMS threshold for "silence" is typically around 10-20 out of 255 — needs empirical tuning
- 1.5s = 1500ms silence duration before auto-stop
