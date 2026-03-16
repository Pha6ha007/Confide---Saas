# S03: Response Mode Selector — UAT

## How to Test

1. **Prerequisites:** Must be on Pro or Premium plan to see voice controls.

2. **Component renders:**
   - Navigate to `/dashboard/chat`
   - In the voice controls bar, should see three buttons: "Text only", "Voice only", "Both"
   - "Text only" should be active by default on first visit

3. **Mode switching:**
   - Click "Voice only" — button should animate to active state
   - Click "Both" — same smooth animation
   - Click "Text only" — back to default

4. **Persistence:**
   - Select "Voice only"
   - Refresh the page
   - "Voice only" should still be selected (read from localStorage)

5. **Behavior — Text only mode:**
   - Send a message
   - Should get text response only, no audio

6. **Behavior — Voice only mode:**
   - Send a message
   - Should get text response AND audio auto-plays
   - (Note: "voice only" still shows text — audio is additive)

7. **Behavior — Both mode:**
   - Send a message
   - Should get text response AND audio auto-plays

8. **localStorage check:**
   - Open DevTools → Application → Local Storage
   - Key `confide_response_mode` should show the selected value
