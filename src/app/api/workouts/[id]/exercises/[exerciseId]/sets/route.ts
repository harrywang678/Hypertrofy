import {NextResponse} from "next/server";
import {workouts} from "@/config/mongoCollections";
import {ObjectId} from "mongodb";
import * as validation from "@/validation";

export async function POST(
  req: Request,
  {params}: {params: Promise<{id: string; exerciseId: string}>}
) {
  try {
    let {id: workoutId, exerciseId} = await params;
    const body = await req.json();

    workoutId = validation.checkIsProperID(workoutId);
    exerciseId = validation.checkIsProperID(exerciseId);
    const reps = body.reps;
    const weight = body.weight;
    if (reps === undefined || weight === undefined) {
      return NextResponse.json(
        {error: "Reps and weight are required"},
        {status: 400}
      );
    }
    if (
      !Number.isInteger(reps) ||
      !Number.isInteger(weight) ||
      reps <= 0 ||
      weight <= 0
    ) {
      return NextResponse.json(
        {error: "Reps and weight must be positive integers"},
        {status: 400}
      );
    }

    const newSet = {
      _id: new ObjectId(),
      reps: reps,
      weight: weight,
      completed: false,
    };

    const workoutCollection = await workouts();

    const result = await workoutCollection.findOneAndUpdate(
      {
        _id: new ObjectId(workoutId),
        "exercises._id": new ObjectId(exerciseId),
      },
      {
        $push: {"exercises.$.sets": newSet},
      },
      {returnDocument: "after"}
    );

    if (!result)
      return NextResponse.json(
        {error: "Workout or Exercise not found"},
        {status: 404}
      );

    return NextResponse.json({
      message: "Set added",
      set: newSet,
      updatedWorkout: result.value,
    });
  } catch (e) {
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}
