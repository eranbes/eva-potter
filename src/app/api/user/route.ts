import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const COOKIE_NAME = 'eva_potter_user_id';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, pin } = body;

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return NextResponse.json(
        { error: 'firstName is required' },
        { status: 400 }
      );
    }

    const trimmedName = firstName.trim();

    // Check if a user with this name already exists (case-insensitive)
    const existing = await db
      .select()
      .from(schema.users)
      .where(sql`lower(${schema.users.firstName}) = ${trimmedName.toLowerCase()}`);

    if (existing.length > 0) {
      // Legacy user with no PIN set — let them straight in and ask them to set one
      const legacyUser = existing.find((u) => u.pin === '');
      if (legacyUser) {
        if (!pin) {
          // Prompt them to choose a PIN (treat like new)
          return NextResponse.json({ needsPin: true, isNew: true });
        }

        if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
          return NextResponse.json(
            { error: 'PIN must be exactly 4 digits' },
            { status: 400 }
          );
        }

        // Set their PIN and resume session
        await db
          .update(schema.users)
          .set({ pin, updatedAt: new Date().toISOString() })
          .where(eq(schema.users.id, legacyUser.id));

        const response = NextResponse.json({ user: { ...legacyUser, pin } });
        response.cookies.set(COOKIE_NAME, legacyUser.id, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax',
        });
        return response;
      }

      // Returning user with a PIN — need pin to verify
      if (!pin) {
        return NextResponse.json({ needsPin: true, isNew: false });
      }

      const matchedUser = existing.find((u) => u.pin === pin);
      if (!matchedUser) {
        return NextResponse.json(
          { error: 'Wrong PIN! Try again.' },
          { status: 401 }
        );
      }

      // Resume session
      const response = NextResponse.json({ user: matchedUser });
      response.cookies.set(COOKIE_NAME, matchedUser.id, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
      return response;
    }

    // New user — need pin to create
    if (!pin) {
      return NextResponse.json({ needsPin: true, isNew: true });
    }

    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    const [user] = await db
      .insert(schema.users)
      .values({
        id,
        firstName: trimmedName,
        pin,
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
