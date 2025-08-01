import {NextRequest, NextResponse} from "next/server";
import {workouts} from "@/config/mongoCollections";
import {ObjectId} from "mongodb";

export async function DELETE(
  req: NextRequest,
  {params}: {params: Promise<{id: string; exerciseId: string}>}
) {
  try {
    const {id: workoutId, exerciseId} = await params;

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
