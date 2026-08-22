# 🎙️ Vocalyze — Digital Access for Everyone

<div align="center">
  <img src="client/public/vocalyze-logo.png" alt="Vocalyze Logo" width="140" height="140" style="border-radius: 50%; box-shadow: 0 0 25px rgba(217, 245, 96, 0.4);" />
  
  <h3>Empowering Visually Impaired, Elderly & Multilingual Citizens with AI-Powered Voice Navigation and Accessible Public Services</h3>

  <p>
    <a href="#-key-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-architecture--workflow">Architecture</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-documentation">API Reference</a> •
    <a href="#-voice-assistant-commands">Voice Guide</a>
  </p>
</div>

---

## 🌟 Overview

**Vocalyze** is an assistive AI-driven digital governance platform designed to make essential public services (such as **Pension Certificates**, **Disability UDID Certificates**, and **Income Certificates**) completely accessible to everyone. 

By combining **Web Speech Recognition**, **Real-time Neural Speech Synthesis**, **Multilingual NLP**, and **Computer Vision OCR**, Vocalyze enables blind, low-vision, illiterate, and motor-impaired individuals to interact with digital forms entirely hands-free using natural voice in their native language (**English**, **हिंदी (Hindi)**, and **ಕನ್ನಡ (Kannada)**).

---

## 🚀 Key Features

### 1. 🗣️ Hands-Free AI Voice Assistant
- **Automatic Spoken Greeting**: Welcomes the user by name upon logging into the dashboard.
- **Voice Service Discovery**: Narrates available government schemes and applications aloud.
- **Voice Selection**: Directs the user to the appropriate application form purely through spoken voice (e.g. *"Apply for Pension Certificate"* or *"ಪಿಂಚಣಿ ಪ್ರಮಾಣಪತ್ರ"*).

### 2. 📝 Interactive Voice-Guided Form Filling
- **Step-by-Step Question Narration**: Speaks every form question aloud at a crisp, natural conversational pace.
- **Continuous Speech Recognition**: Allows natural speaking with intelligent silence debouncing (1.8s timeout) to capture multi-digit numbers (12-digit Aadhaar, 10-digit phone, PPO numbers) without premature cutoffs.
- **Real-Time On-Screen Transcript**: Displays live speech words and extracted values in high contrast as you speak.
- **Instant Yes/No Voice Confirmation**: Prompts confirmation (*"You said: 123456. Correct? Say Yes or No"*), executing instantly with zero delay on affirmative (*"Yes"*, *"Haan"*, *"Haudu"*, *"Correct"*) or negative responses.
- **Direct Spoken Corrections**: If you speak a correction (e.g. changing *"Male"* to *"Female"*), the assistant immediately updates the value and re-confirms.

### 3. 📄 AI Document OCR & Scanner
- **Camera Scanner / File Upload**: Scan physical identity documents (e.g. Aadhaar cards, pension orders).
- **Deterministic & Gemini AI Extraction**: Automatically parses names, dates of birth, genders, and identification numbers from images, auto-filling the form questions instantly.

### 4. 🌐 Multilingual Accessibility
- Full native UI and voice support in **English**, **हिंदी (Hindi)**, and **ಕನ್ನಡ (Kannada)**.
- High-legibility typography with **Plus Jakarta Sans**, **Inter**, **Outfit**, and localized **Noto Sans** scripts.

### 5. ♿ Accessibility Customization
- **High Contrast Dark/Light Modes**: WCAG AAA compliant color contrasts (`#092d2c` deep forest background, `#d9f560` electric lime accents).
- **Scalable Font Sizing**: User-selectable text scale (Standard, Large, Extra Large).
- **Screen Reader Compatibility**: Semantic HTML5 elements and ARIA live regions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Voice & Speech**: Web Speech API (`SpeechSynthesisUtterance` & `webkitSpeechRecognition`)
- **Document OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Styling**: Custom CSS Design System with Vanilla CSS & Glassmorphic tokens
- **Typography**: Google Fonts (*Plus Jakarta Sans*, *Outfit*, *Inter*, *Noto Sans Kannada*, *Noto Sans Devanagari*)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **AI & NLP**: [Google Gemini 1.5 Flash API](https://ai.google.dev/) (`@google/genai`)
- **Database & Auth**: [Google Firebase Firestore & Firebase Admin Auth](https://firebase.google.com/)
- **Security & Utilities**: CORS, dotenv, JSON Web Tokens (JWT)

---

## 🏗️ Architecture & Workflow

```mermaid
flowchart TD
    A[User visits Vocalyze] --> B[Login / Signup]
    B --> C[Accessible Onboarding & Language Selection]
    C --> D[Dashboard with AI Voice Assistant]
    
    D -- "Voice Command: 'Pension Certificate'" --> E[Voice-Guided Form Engine]
    
    subgraph FormEngine [11-Step Interactive Form Engine]
        E --> F[Vocalyze Speaks Question Aloud]
        F --> G[Microphone Listens for User's Spoken Answer]
        G --> H[Real-Time On-Screen Transcript Displayed]
        H --> I[Assistant Asks: 'You said X. Correct? Say Yes or No']
        I -- "User says 'Yes'" --> J[Save Answer to Firestore & Advance to Next Question]
        I -- "User says 'No'" --> F
    end
    
    J -- "All Questions Completed" --> K[Spoken Submission Confirmation]
    K -- "User says 'Submit' / 'Yes'" --> L[Application Submitted to Backend]
    L --> M[Audio Readout of Application ID & Confirmation]
```

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Firebase Project**: Firestore Database enabled
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/v152005/codefury.git
cd codefury
```

---

### 2. Backend Setup
1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ```

3. (Optional) Place your Firebase Service Account JSON as `firebase-authentication.json` in the root directory.

4. Start the backend server:
   ```bash
   npm run dev
   # or node app.js
   ```
   *Backend will run on `http://localhost:5000`.*

---

### 3. Frontend Setup
1. Navigate to the client directory and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:3000`.*

---

## 📡 API Documentation

### Authentication & Profile
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/users/signup` | Register a new user |
| `POST` | `/api/users/login` | Login and receive authentication token |
| `GET` | `/api/profile` | Retrieve user profile & accessibility preferences |
| `POST` | `/api/profile` | Update preferred language, text size & interaction needs |

### Government Services
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/services` | List all available public services |
| `GET` | `/api/services/:id` | Get question schema for a specific service |
| `POST` | `/api/services/seed` | Seed default services (Pension, Disability, Income) |

### Applications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/applications` | Initialize a new application draft |
| `GET` | `/api/applications/:id` | Get application details and saved answers |
| `PATCH` | `/api/applications/:id` | Update answers for specific question fields |
| `POST` | `/api/applications/:id/submit` | Finalize and submit the application |
| `GET` | `/api/applications/user/me` | List all applications filed by current user |

### AI NLP & OCR Parsing
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/parse-response` | Extract structured values from spoken conversational voice |
| `POST` | `/api/ai/parse-document` | Extract fields from OCR scanned image text |

---

## 🎙️ Voice Assistant Commands

| Intent | Spoken Keywords (English / Hindi / Kannada) |
| :--- | :--- |
| **Apply for Pension** | *"Pension"*, *"Pension Certificate"*, *"पेंशन"*, *"ವೃದ್ಧಾಪ್ಯ"*, *"ಪಿಂಚಣಿ"* |
| **Apply for Disability** | *"Disability"*, *"UDID"*, *"दिव्यांगता"*, *"ವಿಕಲಾಂಗತಾ"* |
| **Apply for Income Certificate** | *"Income"*, *"Income Certificate"*, *"आय प्रमाण पत्र"*, *"ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ"* |
| **Affirmative / Confirm** | *"Yes"*, *"Correct"*, *"Confirm"*, *"Haan"*, *"Haudu"*, *"Sari"*, *"हाँ"*, *"ಹೌದು"* |
| **Negative / Retry** | *"No"*, *"Wrong"*, *"Change"*, *"Nahi"*, *"Illa"*, *"नहीं"*, *"ಇಲ್ಲ"* |
| **Submit Form** | *"Submit"*, *"Yes submit"*, *"Apply now"*, *"सबमिट"*, *"ಸಲ್ಲಿಸಿ"* |

---

## 👥 Authors & Acknowledgments

- **Team Vocalyze** — Built with ❤️ for inclusive, accessible, and barrier-free digital governance.
- **GitHub Repository**: [v152005/codefury](https://github.com/v152005/codefury)
