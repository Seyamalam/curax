import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { appointments, doctors } from '@/lib/db/schema';
import { auth } from '@/app/(auth)/auth';
import { eq, and } from 'drizzle-orm';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function POST(request: Request) {
  const { doctorId, userId, time } = await request.json();
  if (!doctorId || !userId || !time) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    );
  }
  const [appointment] = await db
    .insert(appointments)
    .values({ doctorId, userId, time: new Date(time) })
    .returning();
  return NextResponse.json(appointment);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Join appointments with doctors for details
  const userAppointments = await db
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

  return NextResponse.json(userAppointments);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json(
      { error: 'Missing appointment id' },
      { status: 400 },
    );
  }
  // Only allow user to cancel their own appointment
  const [updated] = await db
    .update(appointments)
    .set({ status: 'cancelled' })
    .where(
      and(eq(appointments.id, id), eq(appointments.userId, session.user.id)),
    )
    .returning();
  if (!updated) {
    return NextResponse.json(
      { error: 'Appointment not found or not yours' },
      { status: 404 },
    );
  }
  return NextResponse.json(updated);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, newTime } = await request.json();
  if (!id || !newTime) {
    return NextResponse.json(
      { error: 'Missing appointment id or new time' },
      { status: 400 },
    );
  }
  // Only allow user to reschedule their own appointment
  const [updated] = await db
    .update(appointments)
    .set({ time: new Date(newTime), status: 'rescheduled' })
    .where(
      and(eq(appointments.id, id), eq(appointments.userId, session.user.id)),
    )
    .returning();
  if (!updated) {
    return NextResponse.json(
      { error: 'Appointment not found or not yours' },
      { status: 404 },
    );
  }
  return NextResponse.json(updated);
}
