import { NextRequest, NextResponse } from 'next/server';
import { workouts } from '@/config/mongoCollections';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let workoutCollection = await workouts();

    // Alternative: Using aggregate to sort and limit
    const result = await workoutCollection
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            finished: false,
          },
        },
        {
          $sort: { startTime: -1 },
        },
        { $limit: 1 },
      ])
      .toArray();

    console.log(result);

    const unfinishedWorkout = result[0] || null;

    if (!unfinishedWorkout) {
      return NextResponse.json(
        { error: 'No unfinished workout found' },
        { status: 404 }
      );
    }

    return NextResponse.json(unfinishedWorkout);
  } catch (e: any) {
    console.error('GET /unfinished-workout error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
