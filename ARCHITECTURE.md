# Architecture & System Design

## Overview
The Medicine Impact Simulator is a full-stack application composed of a React frontend and an Express Node.js backend. It leverages the Google Gemini API to synthesize and structure clinical data into a human-readable format.

## Directory Structure

- `/src/`
  - `/components/` - React functional components
    - `MedicineDashboard.tsx` - Main visualization hub
    - `HumanBodySVG.tsx` - Interactive body mapping component
  - `/lib/` - Utility functions (e.g., Markdown export)
  - `App.tsx` - Main application shell and routing state
  - `main.tsx` - React DOM mounting point
  - `index.css` - Tailwind CSS imports and custom global styling
  - `types.ts` - TypeScript interfaces defining the AI JSON schema and application state
- `server.ts` - Express backend entry point
- `vite.config.ts` - Vite build configuration

## Data Flow

1. **User Input**: The user enters a drug name (or multiple drugs) in the search bar on the client.
2. **API Request**: The React app sends a GET request to `/api/analyze?q=[query]`.
3. **Data Gathering (Backend)**: 
   - The Express server receives the request.
   - It simultaneously queries the **RxNav API** and **OpenFDA API** for relevant context based on the input string.
4. **AI Processing**: 
   - The gathered context and the original query are passed to the **Gemini 2.5 Flash** model via the `@google/genai` SDK.
   - The model is instructed to synthesize the data using a strict JSON schema (`responseSchema`).
5. **Response**: The structured JSON is returned to the React frontend.
6. **Rendering**: The `MedicineDashboard` parses the JSON and populates the UI components, charts, and SVG graphics.

## AI Persona Engine
The application allows toggling between 'Patient', 'Student', 'Doctor', and 'Researcher'. This is achieved by prompting the Gemini model to generate four distinct explanations simultaneously within the JSON payload. The UI simply switches which string is displayed based on user selection.

## Build System
The project uses `vite build` to compile the frontend assets into `dist/` and `esbuild` to bundle the Express server into `dist/server.cjs`. This ensures a clean, isolated production artifact.
