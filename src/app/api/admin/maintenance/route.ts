import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'hogwarts';

export async function GET() {
  try {
    const row = await db
      .select()
      .from(schema.gameSettings)
      .where(eq(schema.gameSettings.key, 'maintenance_at'))
      .get();

    if (row) {
      const maintenanceAt = new Date(row.value);
      if (maintenanceAt.getTime() > Date.now() - 10 * 60 * 1000) {
        // Return active if the timestamp is in the future, or up to 10 min past
        // (so takeover stays up until the deploy clears the row)
        return NextResponse.json({ active: true, maintenanceAt: row.value });
      }
    }

    return NextResponse.json({ active: false });
  } catch (error) {
    console.error('Error checking maintenance status:', error);
    return NextResponse.json({ active: false });
  }
}

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

    const maintenanceAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();

    // Upsert: insert or replace
    await db
      .insert(schema.gameSettings)
      .values({ key: 'maintenance_at', value: maintenanceAt })
      .onConflictDoUpdate({
        target: schema.gameSettings.key,
        set: { value: maintenanceAt },
      });

    return NextResponse.json({ success: true, maintenanceAt });
  } catch (error) {
    console.error('Error setting maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to set maintenance' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    await db
      .delete(schema.gameSettings)
      .where(eq(schema.gameSettings.key, 'maintenance_at'));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to cancel maintenance' },
      { status: 500 }
    );
  }
}
