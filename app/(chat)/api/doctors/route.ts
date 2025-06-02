import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { doctors } from '@/lib/db/schema';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function GET() {
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
  return NextResponse.json(allDoctors);
}
