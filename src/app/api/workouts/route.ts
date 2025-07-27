import {createWorkout, getWorkoutById} from "@/data/workouts";
import {NextResponse, NextRequest} from "next/server";
import {ObjectId} from "mongodb";
import {workouts} from "@/config/mongoCollections";

export async function POST(req: NextRequest) {
  try {
    const {userId, name, notes, routineId} = await req.json(); // add routineId

    if (!userId || !name) {
      return NextResponse.json(
        {error: "userId and name are required"},
        {status: 400}
      );
    }

    const newWorkout = await createWorkout(userId, name, notes, routineId); // pass routineId

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
    const workoutCollection = await workouts();

    const allWorkouts = await workoutCollection.find().toArray();

    if (!allWorkouts) {
      return NextResponse.json({error: "No workouts found"}, {status: 404});
    }

    return NextResponse.json(allWorkouts, {status: 200});
  } catch (e: any) {
    return NextResponse.json(
      {error: e.message || "Failed to fetch workout"},
      {status: 500}
    );
  }
}
