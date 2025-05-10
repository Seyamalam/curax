import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  serial,
  integer,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

// Doctor table
export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  specialty: text('specialty').notNull(),
  hospital: text('hospital').notNull(),
  experience: integer('experience').notNull(), // years
  availability: text('availability').notNull(), // e.g., 'Mon-Fri 9am-5pm'
  fees: integer('fees').notNull(), // consultation fee
  bio: text('bio'), // optional short description
  // Add more fields as needed
});

// Appointment table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull().references(() => doctors.id),
  userId: text('user_id').notNull(), // Link to your user system if needed
  time: timestamp('time').notNull(),
  status: text('status').default('booked'),
});

// Ambulance Booking table
export const ambulanceBookings = pgTable('ambulance_bookings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  pickupLocation: text('pickup_location').notNull(),
  destination: text('destination').notNull(),
  time: timestamp('time').notNull(),
  status: text('status').default('booked'),
});

// Labs table
export const labs = pgTable('labs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  timeSlots: json('time_slots').notNull(), // Array of available time slots
});

// Lab Tests table
export const labTests = pgTable('lab_tests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., Blood Test, X-Ray
  type: text('type').notNull(), // e.g., blood, imaging
  price: integer('price').notNull(),
  labId: integer('lab_id').notNull().references(() => labs.id),
});

// Lab Bookings table
export const labBookings = pgTable('lab_bookings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  labId: integer('lab_id').notNull().references(() => labs.id),
  labTestId: integer('lab_test_id').notNull().references(() => labTests.id),
  time: timestamp('time').notNull(),
  locationType: text('location_type').notNull(), // 'home' or 'clinic'
  status: text('status').default('booked'),
});

// Medications table
export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  dosage: text('dosage').notNull(),
  notes: text('notes'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
});

// Medication Reminders table
export const medicationReminders = pgTable('medication_reminders', {
  id: serial('id').primaryKey(),
  medicationId: integer('medication_id').notNull().references(() => medications.id),
  userId: text('user_id').notNull(),
  date: timestamp('date').notNull(), // Date for the reminder
  timeOfDay: text('time_of_day').notNull(), // e.g., '08:00', '20:00'
  status: text('status').default('pending'), // pending/taken/missed
});

// Push Subscriptions table
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  subscription: json('subscription').notNull(),
});

// Prescriptions table
export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  doctorId: integer('doctor_id').notNull().references(() => doctors.id),
  medication: text('medication').notNull(),
  dosage: text('dosage').notNull(),
  instructions: text('instructions'),
  issuedAt: timestamp('issued_at').notNull(),
  expiresAt: timestamp('expires_at'),
  refillable: boolean('refillable').default(false),
  refillsRemaining: integer('refills_remaining').default(0),
  fileUrl: text('file_url'), // URL to digital prescription file (PDF, etc.)
  status: text('status').default('active'), // active, expired, cancelled
});
