import {NextResponse} from "next/server";
import {workouts} from "@/config/mongoCollections";
import {ObjectId} from "mongodb";

export async function DELETE(
  req: Request,
  {params}: {params: {id: string; exerciseId: string}}
) {
  try {
    const workoutId = params.id;
    const exerciseId = params.exerciseId;

    if (!ObjectId.isValid(workoutId) || !ObjectId.isValid(exerciseId)) {
      return NextResponse.json(
        {error: "Invalid workoutId or exerciseId"},
        {status: 400}
      );
    }

    const workoutCollection = await workouts();

    const result = await workoutCollection.findOneAndUpdate(
      {_id: new ObjectId(workoutId)},
      {$pull: {exercises: {_id: new ObjectId(exerciseId)}}},
      {returnDocument: "after"}
    );

    console.log("workout after deleted", result);

    if (!result) {
      return NextResponse.json(
        {error: "Workout or exercise not found"},
        {status: 404}
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("DELETE exercise error:", err);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
