export interface MedicineData {
  summary: {
    genericName: string;
    brandNames: string[];
    drugClass: string;
    mechanism: string;
    halfLife?: string;
    pregnancyCategory?: string;
  };
  bodySystemEffects: BodySystemEffect[];
  riskClassifications: {
    liverToxicity: RiskAssessment;
    kidneyToxicity: RiskAssessment;
    cardiacRisk: RiskAssessment;
    pregnancyRisk: RiskAssessment;
    addictionPotential: RiskAssessment;
  };
  interactions: Interaction[];
  overdose: {
    symptoms: string[];
    actionToTake: string;
    severity: RiskLevel;
  };
  detailedTimeline: {
    stage: string;
    description: string;
  }[];
  educational: {
    patient: string;
    student: string;
    doctor: string;
    researcher: string;
  };
}

export interface BodySystemEffect {
  system: string;
  severity: number;
  positiveEffects: string[];
  negativeEffects: string[];
  commonSideEffects: string[];
  seriousRisks: string[];
  monitoring: string;
  reasoning: string;
  sources: string[];
}

export type RiskLevel = "Safe" | "Low" | "Moderate" | "High" | "Critical";

export interface RiskAssessment {
  level: RiskLevel;
  reasoning: string;
  confidence: number;
}

export interface Interaction {
  type: "Drug" | "Food" | "Alcohol" | "Supplement";
  interactingSubstance: string;
  severity: "Minor" | "Moderate" | "Major";
  description: string;
}
