import {createWorkout, getWorkoutById} from "@/data/workouts";
import {NextResponse, NextRequest} from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {userId, name, notes} = await req.json();

    if (!userId || !name) {
      return NextResponse.json(
        {error: "userId and name are required"},
        {status: 400}
      );
    }

    const newWorkout = await createWorkout(userId, name, notes);

    return NextResponse.json(
      {success: true, workout: newWorkout},
      {status: 201}
    );
  } catch (error: any) {
    console.error("API Error:", error.message);
    return NextResponse.json(
      {error: error.message ?? "Internal Server Error"},
      {status: 500}
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {error: "Workout ID is required"},
        {status: 400}
      );
    }

    const workout = await getWorkoutById(id);
    return NextResponse.json(workout);
  } catch (e: any) {
    return NextResponse.json(
      {error: e.message || "Failed to fetch workout"},
      {status: 500}
    );
  }
}
