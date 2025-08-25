import { tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';

interface AnalyzeSymptomsProps {
  session: Session;
}

export const analyzeSymptoms = ({ session }: AnalyzeSymptomsProps) =>
  tool({
    description:
      'Advanced symptom analysis with triage and personalized recommendations',
    parameters: z.object({
      symptoms: z
        .array(z.string())
        .describe('List of symptoms the user is experiencing'),
      duration: z
        .string()
        .describe(
          'How long symptoms have persisted (e.g., "2 hours", "3 days", "1 week")',
        ),
      severity: z
        .enum(['mild', 'moderate', 'severe', 'critical'])
        .describe('Severity level of symptoms'),
      associatedSymptoms: z
        .array(z.string())
        .optional()
        .describe('Additional symptoms or related factors'),
      medicalHistory: z
        .string()
        .optional()
        .describe('Relevant medical history or current medications'),
      age: z
        .number()
        .optional()
        .describe('User age for age-specific recommendations'),
      gender: z
        .enum(['male', 'female', 'other'])
        .optional()
        .describe('User gender for personalized advice'),
    }),
    execute: async ({
      symptoms,
      duration,
      severity,
      associatedSymptoms = [],
      medicalHistory = '',
      age,
      gender,
    }) => {
      // Emergency symptoms that require immediate attention
      const emergencySymptoms = [
        'chest pain',
        'difficulty breathing',
        'severe shortness of breath',
        'sudden weakness or numbness',
        'severe headache with confusion',
        'uncontrolled bleeding',
        'severe abdominal pain',
        'suicidal thoughts',
        'loss of consciousness',
        'severe allergic reaction',
        'seizure',
      ];

      // High urgency symptoms
      const highUrgencySymptoms = [
        'moderate chest pain',
        'persistent vomiting',
        'high fever',
        'severe dizziness',
        'vision changes',
        'severe dehydration',
        'persistent cough with blood',
        'severe burns',
      ];

      // Symptom analysis logic
      const hasEmergencySymptoms = symptoms.some((symptom) =>
        emergencySymptoms.some((emergency) =>
          symptom.toLowerCase().includes(emergency),
        ),
      );

      const hasHighUrgencySymptoms = symptoms.some((symptom) =>
        highUrgencySymptoms.some((high) =>
          symptom.toLowerCase().includes(high),
        ),
      );

      // Duration analysis
      const durationHours = parseDuration(duration);

      // Age-specific considerations
      const ageGroup = age ? getAgeGroup(age) : 'adult';

      // Gender-specific considerations
      const genderConsiderations = gender
        ? getGenderConsiderations(gender, symptoms)
        : [];

      // Generate triage recommendation
      let triageLevel:
        | 'emergency'
        | 'urgent'
        | 'soon'
        | 'routine'
        | 'self-care';
      let recommendation: string;
      let nextSteps: string[];

      if (hasEmergencySymptoms || severity === 'critical') {
        triageLevel = 'emergency';
        recommendation =
          '🚨 EMERGENCY: Call emergency services (911) immediately or go to the nearest emergency room.';
        nextSteps = [
          'Call emergency services now',
          'If unconscious or not breathing, start CPR if trained',
          'Have someone stay with you',
          'Prepare medical history and current medications',
        ];
      } else if (
        hasHighUrgencySymptoms ||
        severity === 'severe' ||
        durationHours < 24
      ) {
        triageLevel = 'urgent';
        recommendation =
          '⚠️ URGENT: See a healthcare provider within 24 hours or go to urgent care.';
        nextSteps = [
          'Contact your primary care physician',
          'Go to urgent care or emergency room if symptoms worsen',
          'Monitor symptoms closely',
          'Prepare list of symptoms and timeline',
        ];
      } else if (durationHours < 72) {
        triageLevel = 'soon';
        recommendation =
          '📅 SOON: Schedule an appointment with your healthcare provider within 3-5 days.';
        nextSteps = [
          'Schedule appointment with primary care physician',
          'Monitor symptoms for changes',
          'Track symptom progression',
          'Prepare questions for your doctor',
        ];
      } else {
        triageLevel = 'routine';
        recommendation =
          '📋 ROUTINE: Schedule a regular appointment when convenient, but monitor symptoms.';
        nextSteps = [
          'Schedule regular check-up',
          'Continue monitoring symptoms',
          'Practice self-care measures',
          'Contact doctor if symptoms change or worsen',
        ];
      }

      // Generate possible causes (non-diagnostic)
      const possibleCauses = generatePossibleCauses(
        symptoms,
        associatedSymptoms,
        age,
        gender,
      );

      // Generate self-care recommendations
      const selfCareRecommendations = generateSelfCareRecommendations(
        symptoms,
        severity,
      );

      // Generate when to seek immediate care
      const redFlags = generateRedFlags(symptoms);

      return {
        analysis: {
          symptoms: symptoms,
          duration: duration,
          severity: severity,
          triageLevel: triageLevel,
          hasEmergencySymptoms: hasEmergencySymptoms,
          hasHighUrgencySymptoms: hasHighUrgencySymptoms,
        },
        recommendation: recommendation,
        nextSteps: nextSteps,
        possibleCauses: possibleCauses,
        selfCareRecommendations: selfCareRecommendations,
        redFlags: redFlags,
        additionalConsiderations: {
          ageGroup: ageGroup,
          genderConsiderations: genderConsiderations,
          medicalHistory: medicalHistory,
        },
        disclaimer:
          '⚠️ This is not a medical diagnosis. Always consult with a qualified healthcare professional for proper medical advice.',
      };
    },
  });

// Helper functions
function parseDuration(duration: string): number {
  const lower = duration.toLowerCase();
  const match = lower.match(/(\d+)\s*(hour|hr|minute|min|day|week|month)/);

  if (!match) return 24; // Default to 24 hours if can't parse

  const value = Number.parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'hour':
    case 'hr':
      return value;
    case 'minute':
    case 'min':
      return value / 60;
    case 'day':
      return value * 24;
    case 'week':
      return value * 24 * 7;
    case 'month':
      return value * 24 * 30;
    default:
      return 24;
  }
}

function getAgeGroup(age: number): string {
  if (age < 2) return 'infant';
  if (age < 12) return 'child';
  if (age < 18) return 'adolescent';
  if (age < 65) return 'adult';
  return 'senior';
}

function getGenderConsiderations(gender: string, symptoms: string[]): string[] {
  const considerations: string[] = [];

  if (gender === 'female') {
    if (symptoms.some((s) => s.toLowerCase().includes('abdominal pain'))) {
      considerations.push('Consider gynecological causes for abdominal pain');
    }
    if (symptoms.some((s) => s.toLowerCase().includes('chest pain'))) {
      considerations.push(
        'Women may experience different heart attack symptoms',
      );
    }
  }

  if (gender === 'male') {
    if (symptoms.some((s) => s.toLowerCase().includes('prostate'))) {
      considerations.push(
        'Prostate-related symptoms require urological evaluation',
      );
    }
  }

  return considerations;
}

function generatePossibleCauses(
  symptoms: string[],
  associatedSymptoms: string[],
  age?: number,
  gender?: string,
): string[] {
  const causes: string[] = [];

  // Common symptom patterns
  if (symptoms.some((s) => s.toLowerCase().includes('headache'))) {
    causes.push(
      'Tension headache, migraine, sinus pressure, dehydration, stress',
    );
  }

  if (symptoms.some((s) => s.toLowerCase().includes('nausea'))) {
    causes.push(
      'Food poisoning, motion sickness, pregnancy, medication side effects, anxiety',
    );
  }

  if (symptoms.some((s) => s.toLowerCase().includes('fatigue'))) {
    causes.push(
      'Lack of sleep, stress, anemia, thyroid issues, depression, poor nutrition',
    );
  }

  if (symptoms.some((s) => s.toLowerCase().includes('cough'))) {
    causes.push('Common cold, allergies, asthma, acid reflux, post-nasal drip');
  }

  if (symptoms.some((s) => s.toLowerCase().includes('abdominal pain'))) {
    causes.push(
      'Indigestion, gas, constipation, menstrual cramps, food intolerance',
    );
  }

  if (symptoms.some((s) => s.toLowerCase().includes('chest pain'))) {
    causes.push(
      'Heartburn, anxiety, muscle strain, costochondritis (rib pain)',
    );
  }

  // Age-specific considerations
  if (age && age > 65) {
    causes.push(
      'Consider age-related conditions and multiple medication interactions',
    );
  }

  if (age && age < 18) {
    causes.push(
      'Growing pains, viral infections, allergies, school-related stress',
    );
  }

  return causes.length > 0
    ? causes
    : ['Multiple possible causes - consult healthcare provider'];
}

function generateSelfCareRecommendations(
  symptoms: string[],
  severity: string,
): string[] {
  const recommendations: string[] = [];

  if (severity === 'mild') {
    recommendations.push('Rest and monitor symptoms for changes');
    recommendations.push('Stay hydrated with water or electrolyte drinks');
    recommendations.push('Use over-the-counter pain relievers if appropriate');
  }

  if (symptoms.some((s) => s.toLowerCase().includes('headache'))) {
    recommendations.push('Rest in a dark, quiet room');
    recommendations.push('Apply cold or warm compress to forehead');
    recommendations.push('Practice relaxation techniques');
  }

  if (symptoms.some((s) => s.toLowerCase().includes('nausea'))) {
    recommendations.push('Eat small, bland meals');
    recommendations.push('Avoid strong odors and greasy foods');
    recommendations.push('Ginger tea or crackers may help');
  }

  if (symptoms.some((s) => s.toLowerCase().includes('cough'))) {
    recommendations.push('Use honey and lemon in warm water');
    recommendations.push('Use humidifier to add moisture to air');
    recommendations.push('Avoid irritants like smoke and strong perfumes');
  }

  if (symptoms.some((s) => s.toLowerCase().includes('fatigue'))) {
    recommendations.push('Maintain regular sleep schedule');
    recommendations.push('Light exercise and healthy diet');
    recommendations.push('Reduce stress through relaxation techniques');
  }

  return recommendations;
}

function generateRedFlags(symptoms: string[]): string[] {
  const redFlags: string[] = [];

  if (symptoms.some((s) => s.toLowerCase().includes('chest pain'))) {
    redFlags.push(
      'Chest pain with shortness of breath, sweating, or left arm pain',
    );
  }

  if (symptoms.some((s) => s.toLowerCase().includes('headache'))) {
    redFlags.push(
      'Sudden severe headache, worst headache of life, confusion, vision changes',
    );
  }

  if (symptoms.some((s) => s.toLowerCase().includes('abdominal pain'))) {
    redFlags.push('Severe pain, vomiting blood, black stools, fever with pain');
  }

  if (symptoms.some((s) => s.toLowerCase().includes('fever'))) {
    redFlags.push(
      'High fever (>103°F/39.4°C), confusion, difficulty breathing',
    );
  }

  if (symptoms.some((s) => s.toLowerCase().includes('rash'))) {
    redFlags.push(
      'Rash with fever, difficulty breathing, swelling of face/tongue',
    );
  }

  return redFlags.length > 0
    ? redFlags
    : ['Seek immediate care if symptoms worsen rapidly'];
}
