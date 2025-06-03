import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
  tool,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import type { Chat } from '@/lib/db/schema';
import { z } from 'zod';
import {
  doctors,
  appointments,
  ambulanceBookings,
  labs,
  labTests,
  labBookings,
  medications,
  medicationReminders,
  prescriptions,
} from '@/lib/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const listDoctors = tool({
  description: 'List all available doctors and their specialties',
  parameters: z.object({}),
  execute: async () => {
    const allDoctors = await db
      .select({
        id: doctors.id,
        name: doctors.name,
        specialty: doctors.specialty,
        hospital: doctors.hospital,
        experience: doctors.experience,
        availability: doctors.availability,
        fees: doctors.fees,
        bio: doctors.bio,
      })
      .from(doctors);
    return allDoctors;
  },
});

const doctorDetails = tool({
  description: 'Get detailed information about a doctor by their ID or name',
  parameters: z.object({
    doctorId: z.number().optional(),
    name: z.string().optional(),
  }),
  execute: async ({ doctorId, name }) => {
    let doctor;
    if (doctorId) {
      doctor = await db
        .select({
          id: doctors.id,
          name: doctors.name,
          specialty: doctors.specialty,
          hospital: doctors.hospital,
          experience: doctors.experience,
          availability: doctors.availability,
          fees: doctors.fees,
          bio: doctors.bio,
        })
        .from(doctors)
        .where(eq(doctors.id, doctorId));
    } else if (name) {
      doctor = await db
        .select({
          id: doctors.id,
          name: doctors.name,
          specialty: doctors.specialty,
          hospital: doctors.hospital,
          experience: doctors.experience,
          availability: doctors.availability,
          fees: doctors.fees,
          bio: doctors.bio,
        })
        .from(doctors)
        .where(eq(doctors.name, name));
    }
    if (!doctor || doctor.length === 0) {
      throw new Error('Doctor not found');
    }
    return doctor[0];
  },
});

const bookAppointment = tool({
  description: 'Book an appointment with a doctor',
  parameters: z.object({
    doctorId: z.number(),
    time: z.string().describe('Appointment time in ISO format'),
  }),
  execute: async ({ doctorId, time }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const [appointment] = await db
      .insert(appointments)
      .values({ doctorId, userId: session.user.id, time: new Date(time) })
      .returning();
    if (!appointment) {
      throw new Error('Failed to book appointment');
    }
    // Fetch doctor details for confirmation
    const doctor = await db
      .select({
        id: doctors.id,
        name: doctors.name,
        specialty: doctors.specialty,
        hospital: doctors.hospital,
        experience: doctors.experience,
        availability: doctors.availability,
        fees: doctors.fees,
        bio: doctors.bio,
      })
      .from(doctors)
      .where(eq(doctors.id, doctorId));
    return { ...appointment, doctor: doctor[0] };
  },
});

const listAppointments = tool({
  description:
    'List all upcoming appointments for the current user, including doctor details',
  parameters: z.object({}),
  execute: async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const appointmentsWithDoctors = await db
      .select({
        id: appointments.id,
        time: appointments.time,
        status: appointments.status,
        doctor: {
          id: doctors.id,
          name: doctors.name,
          specialty: doctors.specialty,
        },
      })
      .from(appointments)
      .where(eq(appointments.userId, session.user.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id));
    return appointmentsWithDoctors;
  },
});

const cancelAppointment = tool({
  description: 'Cancel an appointment by its ID',
  parameters: z.object({ appointmentId: z.number() }),
  execute: async ({ appointmentId }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const [updated] = await db
      .update(appointments)
      .set({ status: 'cancelled' })
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.userId, session.user.id),
        ),
      )
      .returning();
    if (!updated) {
      throw new Error('Appointment not found or not yours');
    }
    return updated;
  },
});

const rescheduleAppointment = tool({
  description: 'Reschedule an appointment by its ID and new time',
  parameters: z.object({
    appointmentId: z.number(),
    newTime: z.string().describe('New appointment time in ISO format'),
  }),
  execute: async ({ appointmentId, newTime }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const [updated] = await db
      .update(appointments)
      .set({ time: new Date(newTime), status: 'rescheduled' })
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.userId, session.user.id),
        ),
      )
      .returning();
    if (!updated) {
      throw new Error('Appointment not found or not yours');
    }
    return updated;
  },
});

const bookAmbulance = tool({
  description: 'Book an ambulance for the user',
  parameters: z.object({
    pickupLocation: z.string().describe('Pickup location as plain text'),
    destination: z.string().describe('Destination as plain text'),
    time: z.string().describe('Ambulance booking time in ISO format'),
  }),
  execute: async ({ pickupLocation, destination, time }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const [booking] = await db
      .insert(ambulanceBookings)
      .values({
        userId: session.user.id,
        pickupLocation,
        destination,
        time: new Date(time),
      })
      .returning();
    if (!booking) {
      throw new Error('Failed to book ambulance');
    }
    return booking;
  },
});

const listAmbulanceBookings = tool({
  description: 'List all ambulance bookings for the current user',
  parameters: z.object({}),
  execute: async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const bookings = await db
      .select({
        id: ambulanceBookings.id,
        pickupLocation: ambulanceBookings.pickupLocation,
        destination: ambulanceBookings.destination,
        time: ambulanceBookings.time,
        status: ambulanceBookings.status,
      })
      .from(ambulanceBookings)
      .where(eq(ambulanceBookings.userId, session.user.id));
    return bookings;
  },
});

const cancelAmbulanceBooking = tool({
  description: 'Cancel an ambulance booking by its ID',
  parameters: z.object({ bookingId: z.number() }),
  execute: async ({ bookingId }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const [updated] = await db
      .update(ambulanceBookings)
      .set({ status: 'cancelled' })
      .where(
        and(
          eq(ambulanceBookings.id, bookingId),
          eq(ambulanceBookings.userId, session.user.id),
        ),
      )
      .returning();
    if (!updated) {
      throw new Error('Ambulance booking not found or not yours');
    }
    return updated;
  },
});

const listLabs = tool({
  description: 'List all available labs, their tests, prices, and time slots',
  parameters: z.object({}),
  execute: async () => {
    // Get all labs
    const allLabs = await db
      .select({
        id: labs.id,
        name: labs.name,
        address: labs.address,
        timeSlots: labs.timeSlots,
      })
      .from(labs);
    // For each lab, get its tests
    const labsWithTests = await Promise.all(
      allLabs.map(async (lab) => {
        const tests = await db
          .select({
            id: labTests.id,
            name: labTests.name,
            type: labTests.type,
            price: labTests.price,
          })
          .from(labTests)
          .where(eq(labTests.labId, lab.id));
        return { ...lab, tests };
      }),
    );
    return labsWithTests;
  },
});

const bookLabTest = tool({
  description: 'Book a lab test at home or at a clinic',
  parameters: z.object({
    labId: z.number(),
    labTestId: z.number(),
    time: z.string().describe('Lab test time in ISO format'),
    locationType: z.enum(['home', 'clinic']),
  }),
  execute: async ({ labId, labTestId, time, locationType }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const [booking] = await db
      .insert(labBookings)
      .values({
        userId: session.user.id,
        labId,
        labTestId,
        time: new Date(time),
        locationType,
      })
      .returning();
    if (!booking) {
      throw new Error('Failed to book lab test');
    }
    // Fetch lab and test details for confirmation
    const [lab] = await db
      .select({
        id: labs.id,
        name: labs.name,
        address: labs.address,
      })
      .from(labs)
      .where(eq(labs.id, labId));
    const [test] = await db
      .select({
        id: labTests.id,
        name: labTests.name,
        type: labTests.type,
        price: labTests.price,
      })
      .from(labTests)
      .where(eq(labTests.id, labTestId));
    return { ...booking, lab, test };
  },
});

const listLabBookings = tool({
  description: 'List all lab test bookings for the current user',
  parameters: z.object({}),
  execute: async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const bookings = await db
      .select({
        id: labBookings.id,
        time: labBookings.time,
        locationType: labBookings.locationType,
        status: labBookings.status,
        lab: {
          id: labs.id,
          name: labs.name,
        },
        test: {
          id: labTests.id,
          name: labTests.name,
          type: labTests.type,
        },
      })
      .from(labBookings)
      .where(eq(labBookings.userId, session.user.id))
      .leftJoin(labs, eq(labBookings.labId, labs.id))
      .leftJoin(labTests, eq(labBookings.labTestId, labTests.id));
    return bookings;
  },
});

const cancelLabBooking = tool({
  description: 'Cancel a lab test booking by its ID',
  parameters: z.object({ bookingId: z.number() }),
  execute: async ({ bookingId }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const [updated] = await db
      .update(labBookings)
      .set({ status: 'cancelled' })
      .where(
        and(
          eq(labBookings.id, bookingId),
          eq(labBookings.userId, session.user.id),
        ),
      )
      .returning();
    if (!updated) {
      throw new Error('Lab booking not found or not yours');
    }
    return updated;
  },
});

const addMedication = tool({
  description: 'Add a medication and set up reminders',
  parameters: z.object({
    name: z.string(),
    dosage: z.string(),
    notes: z.string().optional(),
    startDate: z.string().describe('Start date in ISO format'),
    endDate: z.string().optional().describe('End date in ISO format'),
    reminders: z.array(
      z.object({
        date: z.string().describe('Date in ISO format'),
        timeOfDay: z.string().describe('Time of day, e.g., 08:00'),
      }),
    ),
  }),
  execute: async ({ name, dosage, notes, startDate, endDate, reminders }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const [med] = await db
      .insert(medications)
      .values({
        userId: session.user.id,
        name,
        dosage,
        notes,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      })
      .returning();
    if (!med) throw new Error('Failed to add medication');
    // Insert reminders
    for (const r of reminders) {
      await db.insert(medicationReminders).values({
        medicationId: med.id,
        userId: session.user.id,
        date: new Date(r.date),
        timeOfDay: r.timeOfDay,
      });
    }
    return med;
  },
});

const listMedications = tool({
  description: 'List all medications for the current user',
  parameters: z.object({}),
  execute: async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    return await db
      .select({
        id: medications.id,
        name: medications.name,
        dosage: medications.dosage,
        notes: medications.notes,
        startDate: medications.startDate,
        endDate: medications.endDate,
      })
      .from(medications)
      .where(eq(medications.userId, session.user.id));
  },
});

const listMedicationReminders = tool({
  description: 'List all medication reminders for the current user',
  parameters: z.object({}),
  execute: async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    return await db
      .select({
        id: medicationReminders.id,
        medicationId: medicationReminders.medicationId,
        date: medicationReminders.date,
        timeOfDay: medicationReminders.timeOfDay,
        status: medicationReminders.status,
      })
      .from(medicationReminders)
      .where(eq(medicationReminders.userId, session.user.id));
  },
});

const markMedicationReminder = tool({
  description: 'Mark a medication reminder as taken or missed',
  parameters: z.object({
    reminderId: z.number(),
    status: z.enum(['taken', 'missed']),
  }),
  execute: async ({ reminderId, status }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const [updated] = await db
      .update(medicationReminders)
      .set({ status })
      .where(
        and(
          eq(medicationReminders.id, reminderId),
          eq(medicationReminders.userId, session.user.id),
        ),
      )
      .returning();
    if (!updated) throw new Error('Reminder not found or not yours');
    return updated;
  },
});

const requestPrescriptionRefill = tool({
  description: 'Request a prescription refill for a given prescription ID',
  parameters: z.object({ prescriptionId: z.number() }),
  execute: async ({ prescriptionId }) => {
    const session = await auth();
    if (!session?.user?.id) throw new Error('User not authenticated');
    // Find prescription and check if refillable and refills remain
    const [prescription] = await db
      .select({
        id: prescriptions.id,
        userId: prescriptions.userId,
        refillable: prescriptions.refillable,
        refillsRemaining: prescriptions.refillsRemaining,
        status: prescriptions.status,
      })
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.id, prescriptionId),
          eq(prescriptions.userId, session.user.id),
        ),
      );
    if (!prescription) throw new Error('Prescription not found');
    if (
      !prescription.refillable ||
      prescription.refillsRemaining === null ||
      prescription.refillsRemaining <= 0 ||
      prescription.status !== 'active'
    ) {
      throw new Error(
        'Prescription is not refillable, has no refills remaining, or is invalid',
      );
    }
    // Decrement refillsRemaining
    const [updated] = await db
      .update(prescriptions)
      .set({ refillsRemaining: (prescription.refillsRemaining ?? 0) - 1 })
      .where(eq(prescriptions.id, prescriptionId))
      .returning();
    return { ...updated, message: 'Refill requested and processed.' };
  },
});

const listPrescriptions = tool({
  description: 'List all prescriptions for the current user',
  parameters: z.object({}),
  execute: async () => {
    const session = await auth();
    if (!session?.user?.id) throw new Error('User not authenticated');
    return await db
      .select({
        id: prescriptions.id,
        doctorId: prescriptions.doctorId,
        medication: prescriptions.medication,
        dosage: prescriptions.dosage,
        instructions: prescriptions.instructions,
        issuedAt: prescriptions.issuedAt,
        expiresAt: prescriptions.expiresAt,
        refillable: prescriptions.refillable,
        refillsRemaining: prescriptions.refillsRemaining,
        fileUrl: prescriptions.fileUrl,
        status: prescriptions.status,
      })
      .from(prescriptions)
      .where(eq(prescriptions.userId, session.user.id));
  },
});

const downloadPrescription = tool({
  description: 'Download a digital prescription file by prescription ID',
  parameters: z.object({ prescriptionId: z.number() }),
  execute: async ({ prescriptionId }) => {
    const session = await auth();
    if (!session?.user?.id) throw new Error('User not authenticated');
    const [prescription] = await db
      .select({ fileUrl: prescriptions.fileUrl })
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.id, prescriptionId),
          eq(prescriptions.userId, session.user.id),
        ),
      );
    if (!prescription || !prescription.fileUrl)
      throw new Error('Prescription file not found');
    return { url: prescription.fileUrl };
  },
});

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new Response('Invalid request body', { status: 400 });
  }

  try {
    const { id, message, selectedChatModel, selectedVisibilityType } =
      requestBody;

    const session = await auth();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new Response(
        'You have exceeded your maximum number of messages for the day! Please try again later.',
        {
          status: 429,
        },
      );
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Forbidden', { status: 403 });
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createDataStream({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                  'listDoctors',
                  'doctorDetails',
                  'bookAppointment',
                  'listAppointments',
                  'cancelAppointment',
                  'rescheduleAppointment',
                  'bookAmbulance',
                  'listAmbulanceBookings',
                  'cancelAmbulanceBooking',
                  'listLabs',
                  'bookLabTest',
                  'listLabBookings',
                  'cancelLabBooking',
                  'addMedication',
                  'listMedications',
                  'listMedicationReminders',
                  'markMedicationReminder',
                  'requestPrescriptionRefill',
                  'listPrescriptions',
                  'downloadPrescription',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
            listDoctors,
            doctorDetails,
            bookAppointment,
            listAppointments,
            cancelAppointment,
            rescheduleAppointment,
            bookAmbulance,
            listAmbulanceBookings,
            cancelAmbulanceBooking,
            listLabs,
            bookLabTest,
            listLabBookings,
            cancelLabBooking,
            addMedication,
            listMedications,
            listMedicationReminders,
            markMedicationReminder,
            requestPrescriptionRefill,
            listPrescriptions,
            downloadPrescription,
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () => stream),
      );
    } else {
      return new Response(stream);
    }
  } catch (_) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  const streamContext = getStreamContext();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('id is required', { status: 400 });
  }

  const session = await auth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  let chat: Chat;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new Response('Not found', { status: 404 });
  }

  if (!chat) {
    return new Response('Not found', { status: 404 });
  }

  if (chat.visibility === 'private' && chat.userId !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new Response('No streams found', { status: 404 });
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new Response('No recent stream found', { status: 404 });
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  return new Response(
    await streamContext.resumableStream(recentStreamId, () => emptyDataStream),
    {
      status: 200,
    },
  );
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }

    const deletedChat = await deleteChatById({ id });

    return Response.json(deletedChat, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
