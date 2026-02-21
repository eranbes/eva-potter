import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const COOKIE_NAME = 'eva_potter_user_id';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName } = body;

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return NextResponse.json(
        { error: 'firstName is required' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    const [user] = await db
      .insert(schema.users)
      .values({
        id,
        firstName: firstName.trim(),
        totalPoints: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const response = NextResponse.json({ user }, { status: 201 });

    response.cookies.set(COOKIE_NAME, id, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

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

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
