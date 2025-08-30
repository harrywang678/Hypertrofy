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

    const {exerciseOrder} = await req.json();

    // Validate the request
    if (!exerciseOrder || !Array.isArray(exerciseOrder)) {
      return NextResponse.json(
        {error: "Exercise order array is required"},
        {status: 400}
      );
    }

    const workoutCollection = await workouts();

    const workout = await workoutCollection.findOne({
      _id: new ObjectId(workoutId),
    });

    if (!workout) {
      return NextResponse.json({error: "Workout not found"}, {status: 404});
    }

    if (!workout.exercises || !Array.isArray(workout.exercises)) {
      return NextResponse.json(
        {error: "Workout has no exercises"},
        {status: 400}
      );
    }

    // Reorder exercises array based on new order
    const reorderedExercises = [];

    // Build new exercises array in the specified order
    for (const {exerciseId} of exerciseOrder) {
      const exercise = workout.exercises.find(
        (ex: any) => ex._id.toString() === exerciseId
      );
      if (exercise) {
        reorderedExercises.push(exercise);
      }
    }

    // Ensure we didn't lose any exercises (safety check)
    if (reorderedExercises.length !== workout.exercises.length) {
      return NextResponse.json(
        {error: "Invalid exercise order - some exercises are missing"},
        {status: 400}
      );
    }

    // Update the workout with new exercise order
    const result = await workoutCollection.findOneAndUpdate(
      {_id: new ObjectId(workoutId)},
      {
        $set: {
          exercises: reorderedExercises,
        },
      },
      {returnDocument: "after"}
    );

    return NextResponse.json({
      message: "Exercise order updated successfully",
      workout: result,
    });
  } catch (err: any) {
    console.error("PATCH /reorder-exercises error:", err);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
