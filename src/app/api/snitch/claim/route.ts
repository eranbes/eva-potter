import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, sql } from 'drizzle-orm';

const COOKIE_NAME = 'eva_potter_user_id';

function scheduleNextEvent() {
  const now = new Date();
  const hoursFromNow = 2 + Math.random() * 2;
  const activatesAt = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
  const rewardPoints = 300 + Math.floor(Math.random() * 201);

  db.insert(schema.snitchEvents)
    .values({
      status: 'pending',
      rewardPoints,
      activatesAt: activatesAt.toISOString(),
      createdAt: now.toISOString(),
    })
    .run();
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE_NAME)?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { eventId } = body;

  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
  }

  // Get the user
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const now = new Date().toISOString();

  // Atomic claim: only succeeds if status is still 'active'
  const result = db.run(
    sql`UPDATE snitch_events SET status = 'claimed', claimed_by_user_id = ${userId}, claimed_by_name = ${user.firstName}, claimed_at = ${now} WHERE id = ${eventId} AND status = 'active'`
  );

  if (result.changes === 0) {
    // Someone else claimed it or it expired — check who won
    const [event] = await db
      .select()
      .from(schema.snitchEvents)
      .where(eq(schema.snitchEvents.id, eventId));

    if (event?.status === 'claimed') {
      return NextResponse.json({
        success: false,
        winner: { name: event.claimedByName, points: event.rewardPoints },
      });
    }

    return NextResponse.json({ success: false, expired: true });
  }

  // Claimed! Get the reward points
  const [event] = await db
    .select()
    .from(schema.snitchEvents)
    .where(eq(schema.snitchEvents.id, eventId));

  const pointsAwarded = event!.rewardPoints;

  // Award points to user
  await db
    .update(schema.users)
    .set({
      totalPoints: user.totalPoints + pointsAwarded,
      updatedAt: now,
    })
    .where(eq(schema.users.id, userId));

  // Schedule next event
  scheduleNextEvent();

  return NextResponse.json({
    success: true,
    pointsAwarded,
    winner: { name: user.firstName, points: pointsAwarded },
    newTotal: user.totalPoints + pointsAwarded,
  });
}
