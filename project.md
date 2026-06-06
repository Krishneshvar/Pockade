# Pockade (Pocket Arcade) - Project Specification

## 1. Project Philosophy & Overview
**Pockade** is an open-source, 100% offline mobile gaming application. It serves as a "sanctuary app" that houses multiple procedurally generated mini-games. 
* **Zero Interruptions:** No advertisements, no in-app purchases, no mandatory online connectivity.
* **Infinite Replayability:** All games rely on Procedural Content Generation (PCG) or algorithmic seeds.
* **The Mascot ("Bit"):** A small, friendly rounded cube with expressive, oversized eyes. Bit acts as the emotional anchor, providing responsive micro-interactions (cheering on wins, sympathetic expressions on losses, and idle animations) to make the UI feel playful and alive.
* **License:** Apache License 2.0 (Requires explicit attribution and copyright retention).

## 2. Visual Identity & UI/UX Design
The app utilizes a "Soft UI" / Claymorphism aesthetic to feel tactile, bouncy, and fun.

### Color Palette
| Role | Color Name | Hex Code | Usage Notes |
| :--- | :--- | :--- | :--- |
| **Primary** | Electric Indigo | `#6366F1` | Brand color, top app bars, primary action buttons ("Play"), active states. |
| **Secondary** | Mint Burst | `#10B981` | Positive actions, completion badges, "New Game" toggles. |
| **Accent** | Mango Tango | `#F59E0B` | Highlights, warnings, new unlocks, achievements. |
| **Bg (Light)** | Cloud White | `#F8FAFC` | Soft, cool off-white reducing eye strain. |
| **Bg (Dark)** | Midnight Slate | `#0F172A` | Deep blue-gray dark mode background. |
| **Surface** | Layer Gray | `#E2E8F0` / `#1E293B` | Cards, dialogs, floating menus (Light/Dark respectively). |

## 3. Technology Stack & Memory Management
* **Framework:** React Native (TypeScript).
* **Game Rendering Engine:** React Native Skia (Shopify).
* **Animations:** React Native Reanimated.
* **State Management (Shell):** Zustand.
* **Local Storage (Hybrid):** 
    * **OP-SQLite:** For relational data (complex game states, seed histories, leaderboards).
    * **MMKV:** For synchronous, ultra-fast Key-Value storage (themes, quick settings).
* **Asset Pre-loading & Garbage Collection:** Skia dynamic vector generation can spike memory. The shell includes a `Texture/Font Garbage Collector` that explicitly flushes Skia memory caches when mounting or unmounting a game engine.

## 4. Architectural Integrity & Developer Experience
**[AGENT DIRECTIVE - STRICT ENFORCEMENT REQUIRED]**
* **The "No-Bleed" Rule:** Game Modules (`/app/games/[GameName]`) CANNOT import dependencies, states, or logic from other Game Modules. They are strictly isolated. They may only communicate with the Shell via the `Unified Game Interface Contract`.
* **Unified Game Interface Contract:** A strict TypeScript interface. Every game must export: `initialize()`, `start()`, `pause()`, `resume()`, `saveState()`, `loadState()`, and `destroy()`.
* **Game Runner / View Container:** A sandboxed UI engine that dynamically mounts the selected game, passing down system configs (theme, audio, haptics, safe area padding).
* **React Error Boundaries (`GameCrashBoundary`):** Wraps the Game Runner. If a PCG algorithm causes an infinite loop or unhandled JS exception, the boundary catches it, terminates the specific game instance, flushes memory, and returns the user to the Main Menu with an apology from Bit the mascot. It prevents a hard crash of the entire OS shell.

## 5. Mobile-Specific UI & Hardware Nuances
* **Global Orientation Manager:** Programmatic screen orientation locking per-game. (e.g., Sudoku locks to Portrait, Tower Defense allows Landscape via an in-game toggle). Always immediately unlocks back to system-default Portrait upon returning to the dashboard.
* **Safe Area & Notch Inset Provider:** The UI Shell globally injects device-specific padding parameters (status bar heights, camera notches, bottom gesture bars) into the game engines to prevent Skia UI elements from rendering underneath physical hardware cutouts.

## 6. Procedural Generation & Seed Architecture
* **Seed Versioning (PCG Pinning):** Algorithms change over time. The Shell stores and passes `AlgorithmVersion` flags alongside the seed (e.g., `pockade://play?game=sudoku&seed=98765&v=1`). The game engine must use legacy generation rules for older saves to prevent board corruption.
* **Deterministic RNG Engine:** JavaScript's `Math.random()` is explicitly banned in Game Modules. The architecture defines a global, deterministic PRNG utility (e.g., Mulberry32) injected by the Shell to ensure a specific seed always generates the exact same game state across all devices.

## 7. Advanced Offline Security & Data Integrity
* **Cryptographic Key Storage:** The salt used for data hashing is never hardcoded. The app utilizes native hardware security modules (Android Keystore / iOS Keychain) to generate and store the unique cryptographic keys.
* **Data Integrity Checksum Guard:** Cryptographic layer appending salt-hashed validation bits to local SQLite high scores to prevent flat-text file editing exploits.
* **Runtime Memory Protection:** Implementation of lightweight memory obfuscation or anti-hooking checks for active game states. This prevents users with rooted devices and tools like GameGuardian from freezing timers or injecting instant-win values directly into RAM.
* **Manual Backup & Restore Driver:** Utility to export the database as an encrypted SQLite file to local storage for manual cross-device migration.

## 8. System Managers & Hardware Abstractions
* **Audio Focus & SFX Engine:** Low-latency pooling for pre-loaded SFX. Listens to OS hardware interruptions (calls, external music) to auto-duck or pause the game automatically.
* **Haptic Bridge:** Wrapper over device vibration hardware. Translates events into waveforms (light tap for selection, sharp buzz for error).
* **Power & Battery Manager:**
    * *Wake-Lock Controller:* Prevents screen dimming during thinking phases.
    * *Thermal Throttling Observer:* Drops non-essential animations or caps FPS if OS reports low battery or high thermal states.

## 9. UI Shell Component Ecosystem
* **Dynamic Asset Bootstrapper (Splash):** Verifies DB integrity, runs data-migrations, and loads the mascot before mounting the main UI.
* **Central Dashboard Hub:** Scannable grid with sorting/filtering and dynamic status badges.
* **Universal In-Game Overlay Menu:** Unobtrusive pause menu injected into every game. Handles pausing, rules, restart, and routing.
* **Accessibility & Theming Controller:** Handles Dark/Light mode, colorblind-friendly asset switches, and dynamic font-scaling.
* **Settings Page:** Includes granular user controls:
    * Theme switcher (Light/Dark/System).
    * **Performance Mode:** Toggle to disable fluid/background animations for older devices.
    * **Audio Toggles:** Separate toggles for Background Music and SFX.
    * Local Push Notifications toggle (e.g., "Daily challenge reminder").
* **Open-Source Disclosure Module:** Standard licensing viewer for internal libraries.

## 10. Maintenance, Logging & Diagnostics (Offline)
* **Buffered Local Log Rotator:** Background logger writing system events and engine traces. Capped at 5MB (rotating across 2 files).
* **Bug Report Exporter:** Compiles local logs, device hardware specs, OS version, and app version into a `.md` file for easy copying into GitHub Issues.
* **Performance Monitor Overlay:** Developer-only toggle tracking FPS, memory footprint, and frame render times to catch resource leaks in PCG algorithms.

## 11. Native Platform Integrations
* **Permissions Gatekeeper:** Handles explicit runtime requests for haptics, external file writing, or notification scheduling.
* **Local Notification Scheduler:** OS-kernel level queue for time-based alerts. Requires zero internet connection.
* **Deep Linking System:** Allows users to share specific procedurally generated seeds via URL (e.g., `pockade://play?game=sudoku&seed=98765`), launching the app directly into that exact offline puzzle.
