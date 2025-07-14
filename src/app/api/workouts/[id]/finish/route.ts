import {NextRequest, NextResponse} from "next/server";
import {workouts} from "@/config/mongoCollections";
import {ObjectId} from "mongodb";
import * as validation from "@/validation";

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    let {id} = await params;
    let workoutId = validation.checkIsProperID(id);

    const workoutCollection = await workouts();

    const workout = await workoutCollection.findOne({
      _id: new ObjectId(workoutId),
    });
    if (!workout) {
      return NextResponse.json({error: "Workout not found"}, {status: 404});
    }

    if (!workout.startTime) {
      return NextResponse.json(
        {error: "Workout is missing a start time"},
        {status: 400}
      );
    }

    const startTime = new Date(workout.startTime);
    const now = new Date();
    const durationInSeconds = Math.floor(
      (now.getTime() - startTime.getTime()) / 1000
    );

    const result = await workoutCollection.findOneAndUpdate(
      {_id: new ObjectId(workoutId)},
      {
        $set: {
          finished: true,
          duration: durationInSeconds,
        },
      },
      {returnDocument: "after"}
    );

    return NextResponse.json(result); // Send the updated workout
  } catch (err: any) {
    console.error("PATCH /finish error:", err);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
