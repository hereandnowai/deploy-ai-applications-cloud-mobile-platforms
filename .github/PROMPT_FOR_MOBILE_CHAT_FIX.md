# PROMPT FOR FIXING MOBILE CHAT WIDGET ON IPHONE

## Current Bug Description
The "Caramel" AI Chatbot widget is not floating correctly on mobile devices, specifically on iPhone Safari. 
- **Symptoms**: The chat icon is hidden/obscured by the Safari address bar (bottom bar). Users have to "pull" the page or flip to landscape to see it. In portrait mode, it is practically inaccessible even with scrolling.
- **Goal**: The chat icon should be a persistent, floating element positioned `20px` from the bottom and `20px` from the right, respecting the iOS "safe area" (where the home indicator is).

## Technical Context
- **File**: `style.css` (specifically the `@media (max-width: 768px)` section).
- **Current implementation**:
  ```css
  .chatbot-container {
      position: fixed !important;
      bottom: env(safe-area-inset-bottom, 20px) !important;
      right: 20px !important;
      z-index: 100000 !important;
  }
  ```
- **Failing Meta Tag**: The current `index.html` uses `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. It is missing `viewport-fit=cover`.

## Why previous attempts failed
1.  **Safety Area Calculation**: Without `viewport-fit=cover` in the meta tag, `env(safe-area-inset-bottom)` can behave inconsistently.
2.  **The "Thin Strip" Bug (CRITICAL)**: If `.chatbot-container` has a `transform` (like `translate3d`), any `position: fixed` child (the chat window) becomes relative to the container instead of the viewport. Since the container is only 65px wide, the window gets squashed into a tiny strip. **NEVER add transform to the parent container.**
3.  **Layout Shifts**: Safari's dynamic toolbar resizes the viewport. 

## Suggested Fix Strategy (Validated)
1.  **Update Meta Tag**: Use `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`.
2.  **Parent Container CSS**:
    - Use `position: fixed`.
    - Set `bottom: calc(25px + env(safe-area-inset-bottom))`.
    - **DO NOT** use `transform` on the `.chatbot-container`.
3.  **Chat Window CSS**:
    - Use `position: fixed`.
    - Set `left: 20px` and `right: 20px` to ensure it spans the screen width on mobile.
    - Use `height: min(550px, calc(100dvh - 160px))` to respect the dynamic viewport.
    - Apply `transform: translate3d(0,0,0)` to the window itself for hardware acceleration.


## Final Note to Developer
The user has reported this failing 5 times. Do not simply repeat the `svh` fix. You must verify the Meta tag and the interaction with the Safari address bar specifically.
