# ⚡ Core Gen — Advanced CC Generator & Checker

<p align="center">
  <img src="./iconapp.png" alt="Core Gen Logo" width="80" />
</p>

<p align="center">
  <strong>A powerful, premium credit card number generator & validator built for developers and testers.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Built%20With-HTML%20%7C%20CSS%20%7C%20JS-orange?style=for-the-badge" alt="Tech Stack" />
</p>

---

## 🔥 What is Core Gen?

Core Gen is a feature-rich, browser-based test credit card number generator powered by the **Luhn Algorithm**. It generates structurally valid card numbers for development & QA testing — no server, no backend, fully client-side.

> ⚠️ **These are NOT real card numbers.** They cannot be used for actual transactions. This tool is strictly for testing & educational purposes.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔢 **BIN-Based Generation** | Enter any BIN (Bank Identification Number) — remaining digits auto-filled with `x` |
| ⚡ **Auto Mode** | One-click generate + check pipeline with smart month/year/CVV |
| 🎛️ **Manual Mode** | Full control over Month, Year, CVV, and Quantity |
| 🛡️ **Built-in Checker** | Luhn validation, expiry check, BIN range validation, CVV format check |
| 📊 **Live/Dead/Unknown** | Cards are sorted into categories with filterable results |
| 🌗 **Light & Dark Theme** | Glassmorphism design with smooth theme toggle |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+G` to generate instantly |
| 📱 **Fully Responsive** | Works perfectly on desktop, tablet, and mobile |
| 📥 **Download & Copy** | Export generated cards as `.txt` or copy to clipboard |
| 🕐 **Session Tracking** | Live stats for cards generated, checked & live count |
| 📋 **Recent BINs** | Quick access to your recently used BINs |

---

## 🛠️ Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Premium glassmorphism design with CSS custom properties
- **JavaScript** — Vanilla JS, zero dependencies
- **Fonts** — Inter + JetBrains Mono (Google Fonts)
- **Icons** — Font Awesome 6.5

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No installation or server required

### Usage

1. Open `index.html` in your browser
2. Enter a **BIN** (e.g., `462548`) — remaining digits auto-fill
3. Choose **Auto** or **Manual** mode
4. Set **Quantity** (1–3000 cards)
5. Click **Generate** (or press `Ctrl+G`)
6. Cards are auto-checked in Auto mode, or use **Send to Checker** in Manual mode

---

## 🔧 How It Works

### Luhn Algorithm
Core Gen uses the **Luhn Algorithm** (Mod 10) to compute a valid check digit, ensuring every generated card number passes structural validation.

### Card Detection
Automatically detects card networks based on BIN prefix:

| Network | BIN Range |
|---|---|
| Visa | `4xxx` |
| Mastercard | `51–55`, `2221–2720` |
| Amex | `34`, `37` |
| Discover | `6011`, `65`, `644–649` |
| JCB | `3528–3589` |
| Diners | `300–305`, `36`, `38` |
| Maestro | `5018`, `5020`, `6304`, etc. |
| UnionPay | `62xx` |

### Checker Pipeline
1. **Format Check** — Digits only
2. **BIN Validation** — Length 13–19, valid first digit
3. **Luhn Check** — Checksum verification
4. **Expiry Validation** — Not expired, not >15 years out
5. **CVV Format** — 3 digits (4 for Amex)

---

## 📸 Preview

<p align="center">
  <img src="./iconapp.png" alt="Core Gen Preview" width="120" />
</p>

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

## 👤 Owner & Contact

Made with ❤️ by **@iq4u8**

- 📩 Telegram: [@iq4u8](https://t.me/iq4u8)

---

## ⚠️ Disclaimer

Core Gen generates **fictitious credit card numbers** solely for **testing and development purposes**. These numbers are not real, do not contain funds, and **cannot be used for actual transactions**. The developer is not responsible for any misuse. Always use this tool responsibly and ethically.

---

<p align="center">
  <sub>⭐ Star this repo if you found it useful!</sub>
</p>
