# TRITON — Hear Beyond.
### Apple-Level Scrollytelling & Cinematic Experience

An Awwwards-grade, Apple-inspired product launch experience engineered for **TRITON flagship wireless earbuds**. Powered by a smooth 299-frame photorealistic image-sequence playback engine, non-overlapping glassmorphic HUD story beats, realistic finish customization with authentic render assets, and pinned scrollytelling.

---

## 🎧 Pinned Scrollytelling Architecture (Hero Section)

- **100vh Sticky Viewport**: The product remains strictly locked dead-center in the screen inside a `400vh` scroll runway (`.scrolly-container`).
- **Zero Scroll Bleed**: Precision CSS sticky positioning (`position: sticky`, `top: 0`, `overflow-x: clip`) to ensure fluid, native pinning across all modern desktop and mobile browsers.
- **Scroll Synchronization**: Scrolling down advances the product narrative from closed case to exploded view; scrolling up smoothly reverses it.
- **The 5 Storytelling Beats (Non-Overlapping HUD Layout)**:
  1. **Beat 1: Flagship Intro (0–15%)**: Assembled hero composition, case opened, earbuds hovering weightlessly with rim lighting.
  2. **Beat 2: Ergonomics & Craftsmanship (15–40%)**: Top-left HUD card displaying ergonomic contours and acoustic vents, completely clear of central earbuds.
  3. **Beat 3: Internal Engineering (40–65%)**: Top-right HUD card showcasing exploded technical architecture (11mm titanium driver, Qi wireless coil, lithium micro-cell, dual-core DSP).
  4. **Beat 4: Acoustic Fidelity (65–85%)**: Top-left HUD card highlighting acoustic chambers, frequency response, and lossless master sound.
  5. **Beat 5: Flagship Reassembly & Final CTA (85–100%)**: Symmetrical reassembly into charging cradle with top-centered call to action.

---

## 🎨 Interactive Color Customization (4 Authentic Variants)

Users can switch between the 4 flagship finishes at any time directly in the Hero Viewport, the Industrial Finishes section, or the Pre-Order Drawer:

| Variant | Finish Details | Authentic Asset |
| :--- | :--- | :--- |
| **Ceramic White** | Signature ceramic composite with liquid reflections | `assets/ceramic-white.jpg` |
| **Glossy Navy** | Deep oceanic gloss finish with cyan highlights | `assets/glossy-navy.png` |
| **Graphite** | Aerospace-grade titanium slate with refined micro-texture | `assets/graphite.png` |
| **Obsidian Black** | Deep vapor-deposited stealth black with dark chrome highlights | `assets/obsidian-black.png` |

---

## 🚀 How to Launch the Experience

### Option 1: One-Click Windows Launcher
Double-click **`start.bat`** in the project folder. It launches the local server and automatically opens Microsoft Edge or your default browser.

### Option 2: Python HTTP Server
```bash
python serve.py
```
Or with Anaconda:
```bash
"D:\AnacondaDAtascience\python.exe" serve.py
```
Visit **`http://localhost:3000`**.

### Option 3: Direct File Opening
Double-click **`index.html`** to open directly in Chrome or Edge.

---

## 📂 Project Structure

```
TRITON/
├── index.html                  # Main Apple-grade landing page
├── styles/
│   └── main.css                # CSS variables, glassmorphic HUD styling, sticky pinning
├── scripts/
│   ├── scrollytelling.js       # 299-frame sequence engine & story beat controller
│   ├── audio-synthesizer.js    # Web Audio API spatial sound generator & visualizer
│   └── interactions.js         # Apple navbar, configurator drawer, color sync
├── assets/                     # High-res authentic product render assets
├── Color choices/              # Original color variant source renders
├── Gifimages/                  # 299 photorealistic render frames (1920x1080)
├── nextjs/                     # Next.js 14 App Router mental model
├── serve.py                    # Static HTTP server with auto browser launch
├── start.bat                   # Windows batch launcher
└── README.md                   # Documentation
```

---

*TRITON — Hear Beyond.*  
Crafted for sound. Designed for life.
