# T01: ResponseModeSelector Component and ChatWindow Integration

**Slice:** S03
**Milestone:** M001-f68xru

## Goal
Create ResponseModeSelector component and wire it into ChatWindow to control voice response behavior.

## Must-Haves

### Truths
- Three buttons render: "Text only", "Voice only", "Both"
- Clicking a button saves the mode to localStorage under `confide_response_mode`
- On page load, the stored mode is restored (default: 'text')
- In 'text' mode: `enableVoiceResponse` is false, no audio auto-play
- In 'voice' mode: `enableVoiceResponse` is true, audio auto-plays, text message still shown
- In 'both' mode: `enableVoiceResponse` is true, audio auto-plays, text message shown
- Component only renders when user has Pro or Premium plan

### Artifacts
- `components/voice/ResponseModeSelector.tsx` — New component (min 40 lines)
- `components/chat/ChatWindow.tsx` — Updated with ResponseModeSelector integration

### Key Links
- `ResponseModeSelector.tsx` → ChatWindow via props (mode, onModeChange)
- ChatWindow → `/api/chat` via `enableVoiceResponse` body param controlled by mode
- ChatWindow → localStorage via `confide_response_mode` key

## Steps
1. Create `components/voice/ResponseModeSelector.tsx` with three mode buttons
2. Style with existing design system: glass morphism, rounded-xl, Framer Motion transitions
3. Add `ResponseMode` type ('text' | 'voice' | 'both') — can be local to component or in types/index.ts
4. Implement localStorage read/write for `confide_response_mode`
5. In ChatWindow: import ResponseModeSelector, add state for responseMode
6. Initialize responseMode from localStorage on mount (default 'text')
7. Replace `agentVoiceEnabled` state + Switch with ResponseModeSelector
8. Update handleSubmit: set `enableVoiceResponse` based on mode ('voice' or 'both' = true)
9. Update audio auto-play: only play when mode is 'voice' or 'both'
10. Keep the voice input toggle (Mic/Keyboard) separate — it controls input, not output
11. Verify TypeScript compiles cleanly

## Context
- ChatWindow currently has `agentVoiceEnabled` state controlled by a Switch toggle
- The Switch sends `enableVoiceResponse: agentVoiceEnabled` to /api/chat
- Audio auto-plays when `data.audioUrl && agentVoiceEnabled`
- Voice input toggle (`isVoiceMode`) controls whether VoiceRecorder or Textarea shows — this is separate from response mode
- Only Pro/Premium users see voice controls (gated by `isVoiceAvailable`)
- Existing UI: voice controls are in a glass-button bar above the input area
