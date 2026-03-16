# S03: Response Mode Selector

**Goal:** Add a ResponseModeSelector component that lets users choose between Text only, Voice only, or Both response modes, persisting preference to localStorage.
**Demo:** In the voice controls area, 3 buttons appear. Selecting one persists the choice. AI responses respect the mode — text only, voice only, or both.

## Must-Haves
- ResponseModeSelector component with 3 buttons: Text only, Voice only, Both
- Selected mode persisted to localStorage under `confide_response_mode`
- Mode restored from localStorage on page load (default: 'text')
- ChatWindow uses stored mode to control `enableVoiceResponse` flag sent to /api/chat
- Audio auto-play respects the mode (no auto-play in 'text' mode, auto-play in 'voice' and 'both')
- Component only visible for Pro/Premium users (voice feature gated)
- Matches existing design system (glass morphism, Tailwind, Framer Motion)

## Tasks

- [x] **T01: ResponseModeSelector component and ChatWindow integration**
  Create the component, wire it into ChatWindow, replace agentVoiceEnabled with mode-based logic.

## Files Likely Touched
- components/voice/ResponseModeSelector.tsx (new)
- components/chat/ChatWindow.tsx
