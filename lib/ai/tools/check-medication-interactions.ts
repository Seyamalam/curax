import { tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';

interface CheckMedicationInteractionsProps {
  session: Session;
}

export const checkMedicationInteractions = ({
  session,
}: CheckMedicationInteractionsProps) =>
  tool({
    description:
      'Check for dangerous drug interactions and provide safety recommendations',
    parameters: z.object({
      medications: z
        .array(z.string())
        .describe('List of current medications the user is taking'),
      newMedication: z
        .string()
        .optional()
        .describe('New medication to check for interactions'),
      symptoms: z
        .array(z.string())
        .optional()
        .describe('Current symptoms that might interact with medications'),
      medicalConditions: z
        .array(z.string())
        .optional()
        .describe('User medical conditions (diabetes, hypertension, etc.)'),
    }),
    execute: async ({
      medications,
      newMedication,
      symptoms = [],
      medicalConditions = [],
    }) => {
      // Known dangerous drug interactions
      const dangerousInteractions = {
        // Blood thinners
        warfarin: [
          'aspirin',
          'ibuprofen',
          'naproxen',
          'heparin',
          'clopidogrel',
        ],
        heparin: ['aspirin', 'ibuprofen', 'naproxen', 'warfarin'],
        clopidogrel: ['omeprazole', 'esomeprazole', 'aspirin'],

        // Blood pressure medications
        lisinopril: ['potassium supplements', 'spironolactone', 'ibuprofen'],
        amlodipine: ['simvastatin', 'grapefruit'],
        metoprolol: ['albuterol', 'ibuprofen'],

        // Diabetes medications
        metformin: ['furosemide', 'corticosteroids', 'iodinated contrast'],
        insulin: ['beta blockers', 'thiazide diuretics', 'corticosteroids'],

        // Cholesterol medications
        simvastatin: ['amlodipine', 'verapamil', 'diltiazem', 'grapefruit'],
        atorvastatin: ['cyclosporine', 'gemfibrozil', 'grapefruit'],

        // Pain medications
        ibuprofen: [
          'warfarin',
          'aspirin',
          'lisinopril',
          'furosemide',
          'lithium',
        ],
        naproxen: [
          'warfarin',
          'aspirin',
          'lisinopril',
          'furosemide',
          'lithium',
        ],
        aspirin: ['warfarin', 'ibuprofen', 'naproxen', 'clopidogrel'],

        // Mental health medications
        sertraline: ['tramadol', 'fentanyl', 'warfarin', 'aspirin'],
        fluoxetine: ['tramadol', 'fentanyl', 'warfarin', 'aspirin'],
        lithium: ['ibuprofen', 'naproxen', 'furosemide', 'spironolactone'],

        // Antibiotics
        ciprofloxacin: ['caffeine', 'warfarin', 'theophylline'],
        azithromycin: ['digoxin', 'warfarin'],

        // Supplements and common OTC
        caffeine: ['ciprofloxacin', 'fluvoxamine'],
        grapefruit: ['simvastatin', 'atorvastatin', 'amlodipine', 'felodipine'],
        'st-johns-wort': ['warfarin', 'oral contraceptives', 'antidepressants'],
      };

      // Medication categories for better recommendations
      const medicationCategories = {
        'blood thinners': [
          'warfarin',
          'heparin',
          'clopidogrel',
          'apixaban',
          'rivaroxaban',
        ],
        'blood pressure': [
          'lisinopril',
          'amlodipine',
          'metoprolol',
          'losartan',
          'hydrochlorothiazide',
        ],
        diabetes: ['metformin', 'insulin', 'glipizide', 'glyburide'],
        cholesterol: [
          'simvastatin',
          'atorvastatin',
          'rosuvastatin',
          'ezetimibe',
        ],
        'pain relief': ['ibuprofen', 'naproxen', 'aspirin', 'acetaminophen'],
        'mental health': [
          'sertraline',
          'fluoxetine',
          'escitalopram',
          'lithium',
        ],
        antibiotics: ['ciprofloxacin', 'azithromycin', 'amoxicillin'],
        supplements: ['caffeine', 'grapefruit', 'st-johns-wort', 'vitamin e'],
      };

      // Check for interactions
      const interactions = [];
      const warnings = [];
      const recommendations = [];

      // Check new medication against existing medications
      if (newMedication) {
        const newMedLower = newMedication.toLowerCase();

        for (const existingMed of medications) {
          const existingMedLower = existingMed.toLowerCase();

          // Check dangerous interactions
          if (
            newMedLower in dangerousInteractions &&
            dangerousInteractions[
              newMedLower as keyof typeof dangerousInteractions
            ]?.includes(existingMedLower)
          ) {
            interactions.push({
              severity: 'dangerous',
              medication1: newMedication,
              medication2: existingMed,
              description: `Dangerous interaction between ${newMedication} and ${existingMed}`,
              action:
                'STOP - Do not take together. Consult doctor immediately.',
            });
          }

          if (
            existingMedLower in dangerousInteractions &&
            dangerousInteractions[
              existingMedLower as keyof typeof dangerousInteractions
            ]?.includes(newMedLower)
          ) {
            interactions.push({
              severity: 'dangerous',
              medication1: existingMed,
              medication2: newMedication,
              description: `Dangerous interaction between ${existingMed} and ${newMedication}`,
              action:
                'STOP - Do not take together. Consult doctor immediately.',
            });
          }
        }
      }

      // Check for category-based warnings
      const categoriesPresent = new Set();

      for (const med of medications) {
        const medLower = med.toLowerCase();
        for (const [category, meds] of Object.entries(medicationCategories)) {
          if (meds.some((m) => medLower.includes(m))) {
            categoriesPresent.add(category);
          }
        }
      }

      // Generate warnings based on categories
      if (
        categoriesPresent.has('blood thinners') &&
        categoriesPresent.has('pain relief')
      ) {
        warnings.push({
          type: 'bleeding_risk',
          message:
            'Increased bleeding risk with blood thinners and pain medications',
          recommendation: 'Use acetaminophen instead of ibuprofen/naproxen',
        });
      }

      if (
        categoriesPresent.has('blood pressure') &&
        categoriesPresent.has('pain relief')
      ) {
        warnings.push({
          type: 'bp_interaction',
          message:
            'Pain medications may reduce effectiveness of blood pressure drugs',
          recommendation: 'Monitor blood pressure closely',
        });
      }

      if (
        categoriesPresent.has('mental health') &&
        categoriesPresent.has('pain relief')
      ) {
        warnings.push({
          type: 'serotonin_syndrome',
          message:
            'Risk of serotonin syndrome with antidepressants and certain pain medications',
          recommendation: 'Avoid tramadol and fentanyl with SSRIs',
        });
      }

      // Check for symptom-medication interactions
      for (const symptom of symptoms) {
        const symptomLower = symptom.toLowerCase();

        if (
          symptomLower.includes('nausea') ||
          symptomLower.includes('vomiting')
        ) {
          if (
            medications.some((med) => med.toLowerCase().includes('metformin'))
          ) {
            recommendations.push('Metformin can cause nausea - take with food');
          }
        }

        if (
          symptomLower.includes('dizziness') ||
          symptomLower.includes('lightheaded')
        ) {
          if (
            medications.some((med) =>
              med.toLowerCase().includes('blood pressure'),
            )
          ) {
            recommendations.push(
              'Blood pressure medications may cause dizziness - change positions slowly',
            );
          }
        }

        if (
          symptomLower.includes('bleeding') ||
          symptomLower.includes('bruising')
        ) {
          if (categoriesPresent.has('blood thinners')) {
            warnings.push({
              type: 'bleeding',
              message: 'Increased bleeding risk with blood thinners',
              recommendation: 'Contact doctor if bleeding is excessive',
            });
          }
        }
      }

      // Check for medical condition interactions
      for (const condition of medicalConditions) {
        const conditionLower = condition.toLowerCase();

        if (conditionLower.includes('diabetes')) {
          if (
            medications.some((med) =>
              med.toLowerCase().includes('beta blocker'),
            )
          ) {
            recommendations.push(
              'Beta blockers may mask low blood sugar symptoms',
            );
          }
        }

        if (conditionLower.includes('hypertension')) {
          if (medications.some((med) => med.toLowerCase().includes('nsaid'))) {
            warnings.push({
              type: 'bp_risk',
              message: 'NSAIDs may increase blood pressure',
              recommendation: 'Monitor blood pressure regularly',
            });
          }
        }

        if (conditionLower.includes('kidney disease')) {
          if (
            medications.some(
              (med) =>
                med.toLowerCase().includes('ibuprofen') ||
                med.toLowerCase().includes('naproxen'),
            )
          ) {
            warnings.push({
              type: 'kidney_risk',
              message: 'NSAIDs may worsen kidney function',
              recommendation: 'Use acetaminophen instead and consult doctor',
            });
          }
        }
      }

      // Generate summary
      const summary = {
        totalMedications: medications.length,
        dangerousInteractions: interactions.filter(
          (i) => i.severity === 'dangerous',
        ).length,
        warnings: warnings.length,
        recommendations: recommendations.length,
        riskLevel: interactions.some((i) => i.severity === 'dangerous')
          ? 'HIGH'
          : warnings.length > 2
            ? 'MODERATE'
            : 'LOW',
      };

      return {
        analysis: {
          medications: medications,
          newMedication: newMedication,
          categoriesPresent: Array.from(categoriesPresent),
          symptoms: symptoms,
          medicalConditions: medicalConditions,
        },
        interactions: interactions,
        warnings: warnings,
        recommendations: recommendations,
        summary: summary,
        disclaimer:
          '⚠️ This is not medical advice. Always consult your healthcare provider or pharmacist for medication interactions.',
      };
    },
  });
