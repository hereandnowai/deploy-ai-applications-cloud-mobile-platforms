# SYSTEM UNDERSTANDING - Deployment of AI Applications Training Program

This document serves as the authoritative source of truth for the codebase, architecture, and current implementation of the "Deployment of AI Applications for Cloud and Mobile Platforms" training program application.

---

## 1. Application Overview
- **Application Name:** Deployment of AI Applications for Cloud and Mobile Platforms Website.
- **Purpose:** A single-page, interactive syllabus and landing page for a 10-day training program conducted by **HERE AND NOW AI** for **Vels Institute of Science, Technology & Advanced Studies (VISTAS)**.
- **Primary Problem it Solves:** Centralizes program information, schedule, and learning outcomes while providing an AI-driven assistant (Caramel) to support prospective students.
- **Target Users:** Students and faculty of VISTAS, and administrators from HERE AND NOW AI.
- **Real-World Use Cases:** Course information dissemination, live AI interaction demonstration, and mobile-friendly syllabus access.

---

## 2. High-Level System Architecture
- **Architecture Style:** Jamstack (Client-Server) utilizing a static frontend with a serverless backend proxy.
- **Frontend ↔ Backend Interaction Flow:**
  - The browser loads static HTML/CSS/JS.
  - The AI Chatbot (Caramel) interacts with a backend proxy via `fetch`.
  - The backend (Cloudflare Pages Functions) handles API requests to the Google Gemini API to hide secrets and manage model logic.
- **External Services Used:**
  - **Google Gemini API:** LLM support (specifically `gemma-3-27b-it`).
  - **Cloudflare Pages:** Hosting and Serverless Functions.
  - **Font Awesome:** Iconography.
  - **Unsplash & GitHub:** Image hosting.

### Text-Based Architecture Diagram
```text
[ Browser ] <--- (HTTPS) ---> [ Cloudflare Edge (CDN) ]
                                      |
                                      +--- [ Static Assets: HTML/CSS/JS ]
                                      |
                                      +--- [ Cloudflare Functions (API Proxy) ]
                                                     |
                                                     +--- (HTTPS + API Key) ---> [ Google Gemini API ]
```

---

## 3. Frontend
- **Framework / Library:** Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Folder Structure:**
  - `/`: Root contains `index.html`, `style.css`, `script.js`.
  - `/branding.json`: Configuration file for brand assets.
- **Routing Mechanism:** Single-page application with anchor-based smooth scrolling (`#about-us`, `#program`, etc.).
- **State Management:** Local DOM state managed via JS variables for chatbot visibility and message history.
- **UI/UX Behavior:**
  - **Themes:** Teal (`#004040`) and Yellow (`#FFDF00`) brand palette.
  - **Animations:** Fade-in effect using `IntersectionObserver`.
  - **Chatbot:** Fixed floating widget with streaming text output.
- **Key Sections:**
  - **Hero:** Branding and program title.
  - **About:** Organization and partner info.
  - **Syllabus:** Detailed 10-day schedule in a responsive table.
  - **Outcomes:** Bulleted list of learning objectives.
  - **Footer:** Social links and contact info.

---

## 4. Backend (Serverless)
- **Runtime & Framework:** Cloudflare Pages Functions (Workflows/Workers).
- **Folder Structure:**
  - `/functions/api/chat.js`: Handles POST requests for the chatbot assistant.
- **API Design Pattern:** RESTful POST endpoint.
- **Logic:**
  - Receives user message and system prompt.
  - Injects `GEMINI_API_KEY` from environment.
  - Forwards request to Google's `streamGenerateContent` endpoint.
  - Proxies the `text/event-stream` back to the client for real-time word-by-word rendering.
- **Error Handling:** Returns 500 status with JSON error message upon API or network failure.

---

## 5. Database & Storage
- **Database Type:** None (Stateless).
- **Schema:** N/A.
- **Storage:** Local configuration is stored in `branding.json`.

---

## 6. API Documentation (AS-IS)

### POST `/api/chat`
- **Purpose:** Proxy communication between frontend and Google Gemini API.
- **Request Payload:**
  ```json
  {
    "message": "User question here",
    "systemPrompt": "Instructional text for AI",
    "model": "gemma-3-27b-it",
    "stream": true
  }
  ```
- **Response Payload:** `text/event-stream` (Server-Sent Events) containing incremental JSON chunks.
- **Authentication Requirement:** None on the endpoint itself; requires `GEMINI_API_KEY` in the environment to function.

---

## 7. Core Functionalities (CURRENT ONLY)
- **AI Chatbot (Caramel):**
  - **Discovery:** Floating button in bottom-right.
  - **Interaction:** Submit text messages; receive real-time streamed responses.
  - **Persona:** Knowledgeable assistant restricted to VISTAS and HERE AND NOW AI topics using a strict `SYSTEM_PROMPT`.
- **Responsive Syllabus Table:**
  - Tabular layout with horizontal scroll on mobile to accommodate multi-column data.
- **Section Smooth Scrolling:**
  - Navigation links trigger smooth transitions to relevant page offsets.
- **Mobile Optimized UI:**
  - Safari/iOS specific fixes for safe-area insets and small viewport height (`svh`).

---

## 8. Configuration & Environment
- **Environment Variables:**
  - `GEMINI_API_KEY`: Secret key for AI model access.
- **Files:**
  - `branding.json`: Brand assets and social links.
  - `.env`: (Local only) Development secrets.
  - `.gitignore`: Prevents `.env` from being committed.

---

## 9. Deployment & Infrastructure
- **Hosting Platform:** Cloudflare Pages.
- **Domain:** `deploy-ai-applications-cloud-mobile-platforms.pages.dev`.
- **Build Flow:** Automated deploy on push to GitHub `main` branch.
- **Infrastructure:** Serverless functions executed at the Edge.

---

## 10. Security Considerations
- **Secret Masking:** API keys are never exposed on the frontend; all AI calls are proxied through serverless functions.
- **Data Protection:** No user data is persisted.
- **Known Limitations:** The `file://` protocol bypass in `script.js` uses a hardcoded test key for local developer convenience (not for production use).

---

## 11. Logging, Monitoring & Debugging
- **Logging:** Console logs in browser for chat errors. Cloudflare Dashboard logs for backend function failures.
- **Debugging:** Local mode toggle in `script.js` detects `window.location.protocol === 'file:'` to bypass the production proxy.

---

## 12. Tech Stack Summary
| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5/CSS3/JS, Intersection Observer API |
| Backend | Cloudflare Pages Functions (JavaScript/V8) |
| AI Model | Google Gemini (Model: gemma-3-27b-it) |
| DevOps | GitHub, Cloudflare Pages |
| External | Font Awesome, Google Generative AI API |

---

## 13. Current Status & Maturity Assessment
- **Status:** Beta / Production-Ready.
- **Complete:** UI layout, branding, chatbot logic, streaming integration, mobile responsiveness, serverless proxy.
- **Partially Implemented:** Detailed individual day resources (syllabus is currently descriptive).

---

## 14. Known Constraints & Assumptions
- **Model dependency:** Strictly bound to `gemma-3-27b-it`.
- **Static Assets:** Images are sourced via absolute URLs from GitHub raw storage.
- **Device Support:** Optimized heavily for iPhone (Safari) and modern Chrome.

---

## 15. Extension Point Design
- **New Sections:** Can be added to `index.html` and styled via `style.css` responsive grid.
- **Functionality:** Additional serverless functions can be added to `/functions/api/` for new backend features.
- **Branding:** Global brand changes can be made via `branding.json` and CSS variables.
