import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { medicationReminders, medications, pushSubscriptions } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { setVapidDetails, sendNotification } from 'web-push';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendDueMedicationReminders() {
  const now = new Date();
  const nowDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const nowTime = now.toTimeString().slice(0, 5); // HH:MM

  // Find reminders due now (within the current minute) and still pending
  const reminders = await db
    .select({
      id: medicationReminders.id,
      userId: medicationReminders.userId,
      medicationId: medicationReminders.medicationId,
      date: medicationReminders.date,
      timeOfDay: medicationReminders.timeOfDay,
      status: medicationReminders.status,
    })
    .from(medicationReminders)
    .where(and(
      eq(medicationReminders.status, 'pending'),
      eq(medicationReminders.date, new Date(nowDate)),
      eq(medicationReminders.timeOfDay, nowTime)
    ));

  for (const reminder of reminders) {
    // Get medication info
    const [med] = await db
      .select({
        name: medications.name,
        dosage: medications.dosage,
      })
      .from(medications)
      .where(eq(medications.id, reminder.medicationId));

    // Get all push subscriptions for the user
    const subs = await db
      .select({ subscription: pushSubscriptions.subscription })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, reminder.userId));

    for (const sub of subs) {
      try {
        // Ensure the subscription object matches the expected PushSubscription structure
        const pushSub = JSON.parse(JSON.stringify(sub.subscription));
        await sendNotification(
          pushSub,
          JSON.stringify({
            title: 'Medication Reminder',
            body: `Time to take your medication: ${med.name} (${med.dosage})`,
            icon: '/icon-192.png',
          })
        );
      } catch (err) {
        console.error('Push notification error:', err);
      }
    }
    // Optionally, mark the reminder as 'notified' or similar
    // await db.update(medicationReminders).set({ status: 'notified' }).where(eq(medicationReminders.id, reminder.id));
  }
} 