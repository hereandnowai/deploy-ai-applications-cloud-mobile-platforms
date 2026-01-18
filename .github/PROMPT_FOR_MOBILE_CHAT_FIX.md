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
1.  **Safety Area Calculation**: Without `viewport-fit=cover` in the meta tag, `env(safe-area-inset-bottom)` can behave inconsistently or return 0, causing the widget to sit at the absolute bottom of the screen, which Safari's toolbar then covers.
2.  **Layout Shifts**: Safari's dynamic toolbar (address bar) resizes the viewport. `position: fixed` elements can sometimes get "stuck" or misaligned if the `body` or `html` height isn't explicitly managed or if there are overflow issues.
3.  **Z-Index/Parenting**: While the z-index is high, if any parent has a `transform`, `filter`, or `perspective` property, it creates a new local coordinate system, and `position: fixed` will behave like `position: absolute` relative to that parent.

## Suggested Fix Strategy (Instructions for Agent)
1.  **Update Meta Tag**: In `index.html`, change the viewport meta tag to:
    `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`
2.  **Fix Layout Constraints**: Ensure `html` and `body` have high-fidelity height settings for mobile:
    ```css
    html, body {
        height: 100%;
        margin: 0;
        -webkit-overflow-scrolling: touch;
    }
    ```
3.  **Adjust Container Positioning**: 
    - Use `bottom: calc(env(safe-area-inset-bottom, 0px) + 20px) !important;` to ensure it always has a minimum 20px padding even if the safe area is 0.
    - Add `transform: translate3d(0,0,0);` to the `.chatbot-container` to promote it to its own compositor layer.
4.  **Handle Active Window**: The `.chatbot-window` should use `100dvh` (Dynamic Viewport Height) or `100svh` (Small Viewport Height) to avoid being cut off by the address bar when it expands.
5.  **Test for Overflow**: Ensure no parent element has `overflow: hidden` on the X-axis that might be clipping the widget.

## Final Note to Developer
The user has reported this failing 5 times. Do not simply repeat the `svh` fix. You must verify the Meta tag and the interaction with the Safari address bar specifically.
