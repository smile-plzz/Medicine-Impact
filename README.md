# Medicine Impact Simulator

A futuristic, AI-powered medical intelligence platform that analyzes medications, visualizes their impact on the human body, and synthesizes clinical data from multiple sources (FDA, RxNav, DailyMed, PubChem) into accessible insights.

## 🚀 Features

- **Futuristic Bio-Metric Interface**: A sleek, dark-mode terminal-inspired UI designed for clarity and deep focus.
- **Dynamic Body Impact Map**: Interactive SVG mapping of the human body highlighting affected organ systems with pulsing risk indicators.
- **Risk Profile Matrix**: Visual breakdown of toxicity risks (Liver, Kidney, Heart, Pregnancy, Addiction) with AI confidence scores and reasoning traces.
- **AI Explanation Modes**: Switch seamlessly between explanations tailored for different personas: Patient, Medical Student, Doctor, and Clinical Researcher.
- **Cross-Reaction & Interaction Checker**: Input multiple medications to simulate and identify severe interactions, mechanisms, and risks.
- **Temporal Progression Timeline**: Track the effects of a drug from immediate onset to long-term usage and withdrawal.
- **Toxicity & Overdose Alerts**: Clear emergency protocols and symptomatology for critical overdose scenarios.
- **Export & Print**: Easily export full medical reports to Markdown or print directly from the dashboard.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Visualization**: Recharts (Risk Data), Custom SVG (Body Map)
- **Icons**: Lucide React
- **Backend**: Express (Node.js) serving as a proxy and AI integration layer
- **AI Intelligence**: Google Gemini API (`gemini-2.5-flash`) for clinical data synthesis and reasoning
- **External Data Sources**: 
  - RxNav API (NIH)
  - OpenFDA API (FDA)

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

### Production Build

To build the application for production:
```bash
npm run build
```
This will create a `dist` folder containing the compiled client assets and the bundled `server.cjs` backend.

To start the production server:
```bash
npm run start
```

## 🧠 Architecture Overview

- **Client-Side Rendering**: The UI is a single-page application built with React, styled heavily with Tailwind CSS utilizing a custom dark theme (`Space Grotesk` and `JetBrains Mono` fonts).
- **Backend Proxy**: The Express server acts as a middleware to securely handle the Gemini API key and external API requests (OpenFDA, RxNav) to prevent CORS issues and secure credentials.
- **AI Synthesis**: The Gemini model receives context from external APIs and generates a highly structured JSON response strictly adhering to the defined schema (`MedicineData` interface in `src/types.ts`).

## ⚠️ Disclaimer

**EDUCATIONAL USE ONLY. NOT FOR MEDICAL DIAGNOSIS.** 
This application is intended solely for educational and informational purposes. It does not provide medical diagnosis or treatment recommendations and should not replace consultation with qualified healthcare professionals.
