import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, desc, asc, sql } from 'drizzle-orm';

const COOKIE_NAME = 'eva_potter_user_id';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const [currentUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Get top 50 users
    const topUsers = await db
      .select({
        id: schema.users.id,
        firstName: schema.users.firstName,
        totalPoints: schema.users.totalPoints,
      })
      .from(schema.users)
      .orderBy(desc(schema.users.totalPoints), asc(schema.users.createdAt))
      .limit(50);

    const leaderboard = topUsers.map((u, index) => ({
      rank: index + 1,
      firstName: u.firstName,
      totalPoints: u.totalPoints,
      isCurrentUser: u.id === userId,
    }));

    // If current user isn't in top 50, append them with their actual rank
    const currentUserInTop50 = leaderboard.some((entry) => entry.isCurrentUser);

    if (!currentUserInTop50) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.users)
        .where(
          sql`${schema.users.totalPoints} > ${currentUser.totalPoints}
          OR (${schema.users.totalPoints} = ${currentUser.totalPoints}
          AND ${schema.users.createdAt} < ${currentUser.createdAt})`
        );

      leaderboard.push({
        rank: count + 1,
        firstName: currentUser.firstName,
        totalPoints: currentUser.totalPoints,
        isCurrentUser: true,
      });
    }

    // House standings: sum of totalPoints grouped by house
    const houseStandings = await db
      .select({
        house: schema.users.house,
        totalPoints: sql<number>`sum(${schema.users.totalPoints})`,
        memberCount: sql<number>`count(*)`,
      })
      .from(schema.users)
      .where(sql`${schema.users.house} IS NOT NULL`)
      .groupBy(schema.users.house)
      .orderBy(desc(sql`sum(${schema.users.totalPoints})`));

    return NextResponse.json({ leaderboard, houseStandings });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
