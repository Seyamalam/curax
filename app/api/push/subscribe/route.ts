import { type NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pushSubscriptions } from '@/lib/db/schema';
import { auth } from '@/app/(auth)/auth';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subscription } = await req.json();
  await db.insert(pushSubscriptions).values({
    userId: session.user.id,
    subscription,
  });

  return NextResponse.json({ success: true });
}