import {NextRequest, NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {workouts} from "@/config/mongoCollections";
import {checkIsProperID, checkIsProperString} from "@/validation";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const {id} = await params;

    if (!id) {
      return NextResponse.json(
        {error: "Workout ID missing in route params"},
        {status: 400}
      );
    }
    const workoutId = checkIsProperID(id, "WorkoutId");

    const workoutCollection = await workouts();

    const workout = await workoutCollection.findOne({
      _id: new ObjectId(workoutId),
    });
    if (!workout) {
      return NextResponse.json({error: "Workout not found"}, {status: 404});
    }

    const {exercises} = await req.json();
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        {error: "Invalid or empty exercises array"},
        {status: 400}
      );
    }

    // Validate each exercise
    const validatedExercises = exercises.map((exercise: any) => {
      const exerciseId = checkIsProperID(exercise.exerciseId, "ExerciseId");
      const name = checkIsProperString(exercise.name, "Exercise Name");
      const muscle = checkIsProperString(exercise.muscle, "Muscle");
      const equipment = checkIsProperString(exercise.equipment, "Equipment");

      return {
        _id: new ObjectId(exerciseId),
        name,
        muscle,
        equipment,
        sets: [], // placeholder for future set tracking
      };
    });

    const updateResult = await workoutCollection.updateOne(
      {_id: new ObjectId(workoutId)},
      {$push: {exercises: {$each: validatedExercises}}}
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update workout with new exercises.");
    }

    return NextResponse.json({message: "Exercises added successfully."});
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {error: error.message || "Server error"},
      {status: 500}
    );
  }
}
