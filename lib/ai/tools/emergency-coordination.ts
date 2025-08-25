import { tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';

interface EmergencyCoordinationProps {
  session: Session;
}

export const emergencyCoordination = ({
  session,
}: EmergencyCoordinationProps) =>
  tool({
    description:
      'Coordinate emergency response, alert contacts, and provide crisis management',
    parameters: z.object({
      emergencyType: z
        .enum([
          'medical',
          'accident',
          'fire',
          'security',
          'natural_disaster',
          'other',
        ])
        .describe('Type of emergency'),
      location: z.string().describe('Current location/address'),
      severity: z
        .enum(['low', 'medium', 'high', 'critical'])
        .describe('Emergency severity level'),
      description: z
        .string()
        .describe('Brief description of the emergency situation'),
      injuries: z
        .array(z.string())
        .optional()
        .describe('Any injuries or medical conditions'),
      peopleInvolved: z
        .number()
        .optional()
        .describe('Number of people involved'),
      emergencyContacts: z
        .array(
          z.object({
            name: z.string(),
            relationship: z.string(),
            phone: z.string(),
            priority: z.enum(['primary', 'secondary', 'tertiary']),
          }),
        )
        .optional()
        .describe('Emergency contacts to notify'),
      medicalInfo: z
        .object({
          conditions: z.array(z.string()).optional(),
          medications: z.array(z.string()).optional(),
          allergies: z.array(z.string()).optional(),
          bloodType: z.string().optional(),
          organDonor: z.boolean().optional(),
        })
        .optional()
        .describe('Critical medical information'),
    }),
    execute: async ({
      emergencyType,
      location,
      severity,
      description,
      injuries = [],
      peopleInvolved = 1,
      emergencyContacts = [],
      medicalInfo = {},
    }) => {
      // Emergency response coordination
      const emergencyResponse = {
        emergencyType,
        location,
        severity,
        description,
        timestamp: new Date().toISOString(),
        responseProtocol: generateResponseProtocol(emergencyType, severity),
        immediateActions: generateImmediateActions(emergencyType, severity),
        emergencyServices: determineEmergencyServices(emergencyType, severity),
        communicationPlan: generateCommunicationPlan(
          emergencyContacts,
          severity,
        ),
        medicalBriefing: generateMedicalBriefing(medicalInfo, injuries),
        safetyInstructions: generateSafetyInstructions(emergencyType),
        followUpPlan: generateFollowUpPlan(emergencyType, severity),
      };

      // Generate emergency notification
      const emergencyNotification = {
        priority: severity === 'critical' ? 'URGENT' : 'HIGH',
        message: generateEmergencyMessage(emergencyType, location, description),
        recipients: emergencyContacts.map((contact) => ({
          name: contact.name,
          phone: contact.phone,
          message: generatePersonalizedMessage(
            contact,
            emergencyType,
            location,
          ),
        })),
        authorities: determineAuthoritiesToNotify(emergencyType, location),
      };

      // Generate coordination checklist
      const coordinationChecklist = {
        immediate: [
          'Ensure personal safety first',
          'Call emergency services if not already done',
          'Provide location details clearly',
          'Stay on the line with emergency services',
          'Notify emergency contacts',
          'Prepare medical information',
        ],
        during: [
          'Follow emergency service instructions',
          'Keep communication lines open',
          'Monitor situation for changes',
          'Assist others if safe to do so',
          'Document important details',
        ],
        after: [
          'Follow up with emergency contacts',
          'Document incident for records',
          'Schedule follow-up medical care',
          'Review emergency preparedness',
          'Update emergency contact information',
        ],
      };

      return {
        emergencyResponse,
        emergencyNotification,
        coordinationChecklist,
        importantReminders: [
          'Your safety is the top priority',
          'Follow instructions from emergency services',
          'Keep emergency contacts informed',
          'Document everything for insurance/follow-up',
          'Seek medical attention even for minor injuries',
        ],
        disclaimer:
          '🚨 This tool coordinates emergency response but does not replace professional emergency services. Always call 911 or local emergency number first.',
      };
    },
  });

// Helper functions
function generateResponseProtocol(
  emergencyType: string,
  severity: string,
): string[] {
  const protocols: Record<string, string[]> = {
    medical: [
      'Call emergency medical services (911/EMS)',
      'Provide clear location and situation description',
      'Stay on the line and follow dispatcher instructions',
      'Prepare medical information and history',
      'Alert emergency contacts',
      'Ensure access for emergency responders',
    ],
    accident: [
      'Ensure scene safety before approaching',
      'Call emergency services immediately',
      'Do not move injured unless absolutely necessary',
      'Provide clear directions to location',
      'Alert emergency contacts',
      'Document witness information if available',
    ],
    fire: [
      'Evacuate the building immediately',
      'Call fire department from safe location',
      'Do not use elevators',
      'Stay low in smoke, cover mouth and nose',
      'Alert others and assist those who need help',
      'Do not re-enter building until cleared by firefighters',
    ],
    security: [
      'Move to a safe location immediately',
      'Call police emergency number',
      'Provide detailed description of threat',
      'Stay on the line with authorities',
      'Follow police instructions exactly',
      'Alert building security if available',
    ],
    natural_disaster: [
      'Move to higher ground (floods) or shelter (storms)',
      'Call emergency services if immediate danger',
      'Follow evacuation orders if issued',
      'Stay tuned to emergency broadcasts',
      'Prepare emergency kit and supplies',
      'Alert emergency contacts of your status',
    ],
  };

  return (
    protocols[emergencyType] || [
      'Call emergency services immediately',
      'Move to a safe location',
      'Follow official instructions',
      'Alert emergency contacts',
      'Document the situation',
    ]
  );
}

function generateImmediateActions(
  emergencyType: string,
  severity: string,
): string[] {
  const actions: Record<string, string[]> = {
    medical: [
      'Call emergency services now',
      'Stay calm and assess the situation',
      'Perform CPR if trained and person is unresponsive',
      'Control bleeding with direct pressure',
      'Monitor breathing and consciousness',
      'Clear airway if obstructed',
    ],
    accident: [
      'Ensure your safety first',
      'Call emergency services',
      'Turn on hazard lights',
      'Move vehicles off the road if safe',
      'Check for injuries in all vehicles',
      'Exchange information with other parties',
    ],
    fire: [
      'Evacuate immediately',
      'Feel doors for heat before opening',
      'Use stairs, never elevators',
      'Crawl under smoke',
      'Cover mouth with wet cloth',
      'Close doors behind you',
    ],
  };

  return (
    actions[emergencyType] || [
      'Ensure personal safety',
      'Call emergency services',
      'Move away from danger',
      'Alert others nearby',
      'Follow emergency protocols',
    ]
  );
}

function determineEmergencyServices(
  emergencyType: string,
  severity: string,
): string[] {
  const services: Record<string, string[]> = {
    medical: ['EMS/Ambulance', 'Paramedics', 'Hospital Emergency Room'],
    accident: ['Police', 'Fire Department', 'Tow Service', 'EMS if injuries'],
    fire: ['Fire Department', 'EMS if injuries', 'Police for traffic control'],
    security: ['Police', 'Security Services', 'Emergency Response Team'],
    natural_disaster: [
      'Emergency Management',
      'Red Cross',
      'Local Authorities',
      'National Guard if needed',
    ],
  };

  return (
    services[emergencyType] || [
      'Local Emergency Services',
      'Police',
      'Fire Department',
    ]
  );
}

function generateCommunicationPlan(
  emergencyContacts: any[],
  severity: string,
): any {
  const plan = {
    primaryContacts: emergencyContacts.filter((c) => c.priority === 'primary'),
    secondaryContacts: emergencyContacts.filter(
      (c) => c.priority === 'secondary',
    ),
    notificationMethod:
      severity === 'critical' ? 'immediate_call' : 'text_first',
    messageTemplate:
      'Emergency: I need assistance. Location: [LOCATION]. Situation: [DESCRIPTION]',
    followUp: 'Send updates every 15 minutes until situation resolved',
  };

  return plan;
}

function generateMedicalBriefing(medicalInfo: any, injuries: string[]): any {
  return {
    criticalInfo: {
      bloodType: medicalInfo.bloodType,
      organDonor: medicalInfo.organDonor,
      allergies: medicalInfo.allergies || [],
    },
    currentConditions: medicalInfo.conditions || [],
    currentMedications: medicalInfo.medications || [],
    currentInjuries: injuries,
    importantNotes: [
      'Carry medical alert information',
      'Inform emergency services of allergies',
      'Mention current medications',
      'Note any medical conditions',
    ],
  };
}

function generateSafetyInstructions(emergencyType: string): string[] {
  const instructions: Record<string, string[]> = {
    medical: [
      'Do not leave the person alone if they are unconscious',
      'Do not give anything to eat or drink if person is unresponsive',
      'Do not move person unless in immediate danger',
      'Keep person warm but not overheated',
      'Be prepared to perform CPR if needed',
    ],
    fire: [
      'Never go back into a burning building',
      'If clothes catch fire, stop, drop, and roll',
      'Stay low in smoke, cover mouth and nose',
      'Use the back of your hand to test doors',
      'If trapped, seal gaps around doors with wet towels',
    ],
    accident: [
      'Do not admit fault at the scene',
      'Take photos of the accident scene',
      'Exchange insurance information',
      'Seek medical attention even if you feel fine',
      'Report the accident to police if injuries occurred',
    ],
  };

  return (
    instructions[emergencyType] || [
      'Prioritize personal safety',
      'Follow emergency service instructions',
      'Do not put yourself in danger',
      'Assist others only if safe to do so',
      'Stay calm and provide clear information',
    ]
  );
}

function generateFollowUpPlan(emergencyType: string, severity: string): any {
  return {
    immediate: [
      'Follow up with emergency contacts',
      'Schedule follow-up medical care',
      'Document incident for insurance',
      'Preserve evidence if applicable',
    ],
    shortTerm: [
      'Seek psychological support if needed',
      'Review emergency preparedness',
      'Update emergency contact information',
      'Consider additional safety measures',
    ],
    longTerm: [
      'Schedule regular health check-ups',
      'Review and update emergency plans',
      'Consider additional training or courses',
      'Join support groups if applicable',
    ],
  };
}

function generateEmergencyMessage(
  emergencyType: string,
  location: string,
  description: string,
): string {
  return `🚨 EMERGENCY ALERT 🚨

Type: ${emergencyType.toUpperCase()}
Location: ${location}
Description: ${description}
Time: ${new Date().toLocaleString()}

Please respond immediately or contact emergency services.`;
}

function generatePersonalizedMessage(
  contact: any,
  emergencyType: string,
  location: string,
): string {
  return `Hi ${contact.name}, this is an emergency notification. I'm experiencing a ${emergencyType} situation at ${location}. Please contact me immediately or call emergency services.`;
}

function determineAuthoritiesToNotify(
  emergencyType: string,
  location: string,
): string[] {
  const authorities: Record<string, string[]> = {
    medical: ['Local EMS', 'Nearest Hospital'],
    accident: ['Local Police', 'Highway Patrol if applicable'],
    fire: ['Local Fire Department', 'Fire Marshal'],
    security: ['Local Police', 'Security Companies'],
    natural_disaster: [
      'Emergency Management Agency',
      'Local Authorities',
      'FEMA if applicable',
    ],
  };

  return authorities[emergencyType] || ['Local Emergency Services'];
}
