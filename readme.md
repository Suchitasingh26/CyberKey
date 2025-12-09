# CyberKey | Enterprise Identity Protection System

![Status](https://img.shields.io/badge/Status-Enterprise_Edition-purple?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-AES_Simulated-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge)

**CyberKey** is a secure, client-side credential management system designed to protect sensitive identity data. It utilizes a zero-knowledge architecture where data is encrypted and stored locally within the browser, ensuring persistence without external server dependencies.

---

## ⚡ Live Demo

**Click the button below to launch the application:**

[![Open Live App](https://img.shields.io/badge/🚀_LAUNCH-CYBERKEY_LIVE-success?style=for-the-badge&logo=vercel)](https://suchitasingh26.github.io/CyberKey/)

> **🔐 Default Access PIN:** `0000`

---

## 🚀 Core Features

### 1. Security & Authentication
* **Biometric-Style Lock Screen:** Simulates a high-security entry point.
* **Session Persistence:** The app automatically locks if refreshed.
* **Custom PIN System:** Users can update their security PIN in settings.
* **Emergency Reset:** Fail-safe mechanism to factory reset data in case of corruption.

### 2. Data Management (CRUD)
* **Add & Edit:** Seamlessly save new credentials or update existing ones.
* **Smart Search:** Real-time filtering to locate accounts instantly.
* **Data Backup:** One-click JSON export to download a local copy of the vault.
* **Visual Encryption:** Passwords are masked and base64 encoded for storage safety.

### 3. User Experience (UI/UX)
* **Glassmorphism Interface:** Modern, translucent aesthetics using Tailwind CSS.
* **Responsive Design:** Optimized for Desktops, Tablets, and Mobile screens.
* **Interactive Feedback:** Toast notifications provide system status updates.

---

## 🛠️ Technology Stack

* **Frontend:** HTML5
* **Styling:** Tailwind CSS (Utility-First Framework)
* **Logic:** Vanilla JavaScript (ES6+)
* **Storage:** Browser LocalStorage API
* **Icons:** FontAwesome 6.0

---

## 📂 Project Structure

```text
CyberKey/
├── index.html      # Main application interface
├── style.css       # Custom animations and glass effects
├── script.js       # Core logic, auth handling, and encryption
└── README.md       # Documentation

