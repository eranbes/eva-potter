import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, or, sql } from 'drizzle-orm';

function scheduleNextEvent() {
  const now = new Date();
  const hoursFromNow = 2 + Math.random() * 2; // 2-4 hours
  const activatesAt = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
  const rewardPoints = 300 + Math.floor(Math.random() * 201); // 300-500

  db.insert(schema.snitchEvents)
    .values({
      status: 'pending',
      rewardPoints,
      activatesAt: activatesAt.toISOString(),
      createdAt: now.toISOString(),
    })
    .run();
}

export async function GET() {
  const now = new Date().toISOString();

  // Find the current active or most recent pending event
  const [event] = await db
    .select()
    .from(schema.snitchEvents)
    .where(or(eq(schema.snitchEvents.status, 'pending'), eq(schema.snitchEvents.status, 'active')))
    .orderBy(schema.snitchEvents.id)
    .limit(1);

  // No pending/active event — schedule one
  if (!event) {
    scheduleNextEvent();
    return NextResponse.json({ active: false });
  }

  // Pending event whose time has come → activate it
  if (event.status === 'pending' && event.activatesAt <= now) {
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    await db
      .update(schema.snitchEvents)
      .set({ status: 'active', expiresAt })
      .where(eq(schema.snitchEvents.id, event.id));

    return NextResponse.json({
      active: true,
      eventId: event.id,
      expiresAt,
      rewardPoints: event.rewardPoints,
    });
  }

  // Active event — check if expired
  if (event.status === 'active') {
    if (event.expiresAt && event.expiresAt < now) {
      // Expired — mark it and schedule next
      await db
        .update(schema.snitchEvents)
        .set({ status: 'expired' })
        .where(eq(schema.snitchEvents.id, event.id));

      scheduleNextEvent();
      return NextResponse.json({ active: false, escaped: true });
    }

    return NextResponse.json({
      active: true,
      eventId: event.id,
      expiresAt: event.expiresAt,
      rewardPoints: event.rewardPoints,
    });
  }

  // Still pending but not yet time
  return NextResponse.json({ active: false });
}
