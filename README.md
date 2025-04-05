# 🎯 Gabor Grating Generator

An interactive, browser-based Gabor grating generator designed for **visual perception research**, **psychophysical experiments**, **vision science education**, and **clinical or computational analysis**.


---

## 🚀 Features

- 📐 **Orientation, Phase, Spatial Frequency (Periods) Controls**
- 🌀 **Envelope Types** (Gaussian, Linear, Cosine, Hann, Hamming, Circular, Rectangular, None)
- 🎚️ **Envelope Width** control with real-time visual feedback
- 🎨 **Custom Colors** for peaks and troughs (manual RGB)
- 🖤 **Grayscale Mode** via **Mid Luminance** and **Contrast** sliders
- 📏 **Downloadable High-Resolution Gratings** (100–800px)
- ⚠️ **Live frequency feedback** with warning when approaching Nyquist limit (`0.5 cyc/px`)
- 🧠 Built with **pure JavaScript**, **HTML5**, and **CSS3** – no dependencies!

---

## 🧪 What are Gabor Gratings?

Gabor gratings are sinusoidal luminance patterns modulated by an envelope function (typically Gaussian). They're used widely in:

- 🧠 **Vision Science**: studying spatial frequency, orientation selectivity
- 🧪 **Psychophysics**: testing contrast sensitivity and perception thresholds
- 🧬 **Clinical Diagnosis**: detecting amblyopia or visual field defects
- 🤖 **Computer Vision**: feature extraction, texture analysis

---

## 📷 Preview & Interface

![UI Screenshot](./screenshot.png)

Each control is interactive and synchronized:
- Sliders and number inputs stay in sync
- Changing `Mid Luminance` and `Contrast` automatically updates the grayscale RGB boxes
- All changes instantly render a new preview

---

## 🎛 Controls Overview

| Control            | Description                                                  |
|--------------------|--------------------------------------------------------------|
| Orientation        | Rotates the grating (0° = horizontal, 90° = vertical)         |
| Phase              | Shifts the sine wave spatially (peak vs trough centered)      |
| Periods            | Number of sine wave cycles; affects spatial frequency         |
| Envelope Width     | Controls how sharply the grating fades from center            |
| Envelope Type      | Shape of the modulation envelope (Gaussian, Cosine, etc.)     |
| Mid Luminance      | The background gray level (0–255); center of sine wave        |
| Contrast           | How far the sine wave stretches above/below the midpoint      |
| Peak/Trough Colors | Set manually for RGB; or auto-sync with grayscale settings    |
| Size               | Affects download resolution (preview always 200×200)          |

---

## 🧩 How Contrast and Mid Luminance Work

If Mid = 128 and Contrast = 1 → range is ±127.5  
If Mid = 250 and Contrast = 1 → range is ±5  
This allows **precise control of visibility**, useful in **threshold detection tasks**.

---

## 📦 Installation

```bash
git clone https://github.com/didzislauva/GaborGratingGenerator.git
cd GaborGratingGenerator
