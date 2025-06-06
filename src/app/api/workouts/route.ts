import { createWorkout } from '@/data/workouts';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, name, notes } = await req.json();

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'userId and name are required' },
        { status: 400 }
      );
    }

    const newWorkout = await createWorkout(userId, name, notes);

    return NextResponse.json(
      { success: true, workout: newWorkout },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { error: error.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}
