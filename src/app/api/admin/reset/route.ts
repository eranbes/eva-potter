import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { sql } from 'drizzle-orm';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'hogwarts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Count users before deleting
    const [{ count: userCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users);

    // Delete in order respecting foreign keys
    await db.delete(schema.userAnswers);
    await db.delete(schema.userProgress);
    await db.delete(schema.wordleResults);
    await db.delete(schema.users);

    return NextResponse.json({
      success: true,
      deletedUsers: userCount,
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { error: 'Failed to reset data' },
      { status: 500 }
    );
  }
}
