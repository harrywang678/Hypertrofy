import {NextResponse} from "next/server";
import {workouts} from "@/config/mongoCollections";
import {ObjectId} from "mongodb";
import * as validation from "@/validation";

export async function POST(
  req: Request,
  {params}: {params: {id: string; exerciseId: string}}
) {
  try {
    let {id: workoutId, exerciseId} = await params;
    const body = await req.json();

    workoutId = validation.checkIsProperID(workoutId);
    exerciseId = validation.checkIsProperID(exerciseId);

    const newSet = {
      _id: new ObjectId(),
      reps: body.reps,
      weight: body.weight,
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
