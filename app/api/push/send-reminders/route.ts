import { type NextRequest, NextResponse } from 'next/server';
import { sendDueMedicationReminders } from '@/lib/notifications/sendMedicationReminders';
import { auth } from '@/app/(auth)/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await sendDueMedicationReminders();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 