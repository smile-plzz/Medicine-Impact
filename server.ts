import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import Database from "better-sqlite3";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const db = new Database("medicine_impact.db");

// Initialize Database
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cache (
    query TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/history", (req, res) => {
    try {
      const history = db.prepare("SELECT query, created_at FROM search_history ORDER BY created_at DESC LIMIT 10").all();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.get("/api/medicine/:name", async (req, res) => {
    try {
      const medicineName = req.params.name.toLowerCase().trim();
      
      // Log search history
      db.prepare("INSERT INTO search_history (query) VALUES (?)").run(medicineName);

      // Check Cache
      const cached = db.prepare("SELECT data FROM cache WHERE query = ?").get(medicineName) as { data: string } | undefined;
      if (cached) {
        return res.json(JSON.parse(cached.data));
      }
      
      let rxNavContext = "";
      try {
        const queryName = medicineName.split(' ')[0]; // Basic way to get first term
        const rxNavRes = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(queryName)}`);
        if (rxNavRes.ok) {
          const rxNavData = await rxNavRes.json();
          if (rxNavData.drugGroup?.conceptGroup) {
            rxNavContext = `\n\nData from RxNav API for ${queryName}: Found related concepts.`;
          }
        }
      } catch (err) {
        console.error("RxNav fetch failed", err);
      }

      let fdaContext = "";
      try {
        const queryName = medicineName.split(' ')[0]; // Basic way to get first term
        const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${queryName}"+openfda.generic_name:"${queryName}"&limit=1`);
        if (fdaRes.ok) {
          const fdaData = await fdaRes.json();
          if (fdaData.results && fdaData.results.length > 0) {
            const result = fdaData.results[0];
            fdaContext = `\n\nData from OpenFDA API for ${queryName}:\n- Boxed Warning: ${result.boxed_warning?.[0] || 'None'}\n- Adverse Reactions: ${result.adverse_reactions?.[0] || 'Unknown'}\n- Drug Interactions: ${result.drug_interactions?.[0] || 'Unknown'}\n- Overdosage: ${result.overdosage?.[0] || 'Unknown'}\n\n`;
          }
        }
      } catch (err) {
        console.error("OpenFDA fetch failed", err);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a medical intelligence agent. Analyze the medicine(s) "${medicineName}". ${fdaContext} ${rxNavContext}
        If the input "${medicineName}" is clearly NOT a recognized medication, drug, or combination (e.g. gibberish, non-medical terms like "pizza"), set the "error" field to "Not a recognized medicine" and fill all other required fields with "N/A" or empty arrays.
        Otherwise, synthesize data as if combining information from RxNav, OpenFDA, DailyMed, and PubChem.
        If multiple medicines are provided (e.g. for interaction checking or comparison "Drug A vs Drug B"), focus heavily on their interactions/comparison but provide the summary for the combination or the primary one.
        Provide a comprehensive, highly structured JSON response detailing its effects, risks, body system interactions, overdose risks, and detailed timelines. Make sure to provide confidence scores and sources (e.g. 'FDA', 'DailyMed', 'Gemini Synthesis') to explain your reasoning.
        Ensure you provide distinct educational explanations for four personas: Patient, Student, Doctor, and Researcher.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              error: { type: Type.STRING, description: "Set this ONLY if the input is not a recognized medicine." },
              summary: {
                type: Type.OBJECT,
                properties: {
                  genericName: { type: Type.STRING },
                  brandNames: { type: Type.ARRAY, items: { type: Type.STRING } },
                  drugClass: { type: Type.STRING },
                  mechanism: { type: Type.STRING, description: "Simple explanation of how it works" },
                  halfLife: { type: Type.STRING },
                  pregnancyCategory: { type: Type.STRING }
                },
                required: ["genericName", "brandNames", "drugClass", "mechanism"]
              },
              bodySystemEffects: {
                type: Type.ARRAY,
                description: "Map effects to these specific body systems: Brain, Eyes, Heart, Lungs, Liver, Kidneys, Stomach, Intestines, Pancreas, Skin, Blood, Immune System, Hormonal System, Reproductive System, Nervous System, Musculoskeletal System.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    system: { type: Type.STRING, description: "Name of the body system (e.g., Liver, Heart)" },
                    severity: { type: Type.INTEGER, description: "0-10 scale of negative impact risk (10 being highest risk)" },
                    positiveEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
                    negativeEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
                    commonSideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
                    seriousRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    monitoring: { type: Type.STRING, description: "What to monitor (e.g., liver enzymes)" },
                    reasoning: { type: Type.STRING, description: "Brief explanation of why this system is affected and why it got this severity score." },
                    sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sources for this information, e.g. ['OpenFDA', 'Gemini Synthesis']" }
                  },
                  required: ["system", "severity", "positiveEffects", "negativeEffects", "commonSideEffects", "seriousRisks", "monitoring", "reasoning", "sources"]
                }
              },
              riskClassifications: {
                type: Type.OBJECT,
                properties: {
                  liverToxicity: { 
                    type: Type.OBJECT, 
                    properties: { level: { type: Type.STRING, enum: ["Safe", "Low", "Moderate", "High", "Critical"] }, reasoning: { type: Type.STRING }, confidence: { type: Type.INTEGER } },
                    required: ["level", "reasoning", "confidence"]
                  },
                  kidneyToxicity: { 
                    type: Type.OBJECT, 
                    properties: { level: { type: Type.STRING, enum: ["Safe", "Low", "Moderate", "High", "Critical"] }, reasoning: { type: Type.STRING }, confidence: { type: Type.INTEGER } },
                    required: ["level", "reasoning", "confidence"]
                  },
                  cardiacRisk: { 
                    type: Type.OBJECT, 
                    properties: { level: { type: Type.STRING, enum: ["Safe", "Low", "Moderate", "High", "Critical"] }, reasoning: { type: Type.STRING }, confidence: { type: Type.INTEGER } },
                    required: ["level", "reasoning", "confidence"]
                  },
                  pregnancyRisk: { 
                    type: Type.OBJECT, 
                    properties: { level: { type: Type.STRING, enum: ["Safe", "Low", "Moderate", "High", "Critical"] }, reasoning: { type: Type.STRING }, confidence: { type: Type.INTEGER } },
                    required: ["level", "reasoning", "confidence"]
                  },
                  addictionPotential: { 
                    type: Type.OBJECT, 
                    properties: { level: { type: Type.STRING, enum: ["Safe", "Low", "Moderate", "High", "Critical"] }, reasoning: { type: Type.STRING }, confidence: { type: Type.INTEGER } },
                    required: ["level", "reasoning", "confidence"]
                  }
                },
                required: ["liverToxicity", "kidneyToxicity", "cardiacRisk", "pregnancyRisk", "addictionPotential"]
              },
              interactions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["Drug", "Food", "Alcohol", "Supplement"] },
                    interactingSubstance: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["Minor", "Moderate", "Major"] },
                    description: { type: Type.STRING }
                  },
                  required: ["type", "interactingSubstance", "severity", "description"]
                }
              },
              overdose: {
                type: Type.OBJECT,
                properties: {
                  symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                  actionToTake: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["Safe", "Low", "Moderate", "High", "Critical"] }
                },
                required: ["symptoms", "actionToTake", "severity"]
              },
              detailedTimeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stage: { type: Type.STRING, description: "e.g., '0-2 hours', '24 hours', '1 week'" },
                    description: { type: Type.STRING }
                  },
                  required: ["stage", "description"]
                }
              },
              educational: {
                type: Type.OBJECT,
                properties: {
                  patient: { type: Type.STRING, description: "Patient-friendly explanation" },
                  student: { type: Type.STRING, description: "Explanation tailored for a medical student learning pharmacology." },
                  doctor: { type: Type.STRING, description: "Clinical explanation for a practicing physician." },
                  researcher: { type: Type.STRING, description: "In-depth mechanism and literature-level explanation for a clinical researcher." }
                },
                required: ["patient", "student", "doctor", "researcher"]
              }
            },
            required: ["summary", "bodySystemEffects", "riskClassifications", "interactions", "overdose", "detailedTimeline", "educational"]
          }
        }
      });

      if (!response.text) {
        throw new Error("No response from AI");
      }

      const data = JSON.parse(response.text);
      
      if (data.error) {
        return res.status(400).json({ error: data.error });
      }

      // Save to cache
      db.prepare("INSERT OR REPLACE INTO cache (query, data) VALUES (?, ?)").run(medicineName, JSON.stringify(data));

      res.json(data);
    } catch (error: any) {
      console.error("Error generating medicine data:", error);
      res.status(500).json({ error: error.message || "Failed to generate medicine data" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
