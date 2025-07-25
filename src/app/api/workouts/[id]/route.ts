import {NextRequest, NextResponse} from "next/server";
import {workouts} from "@/config/mongoCollections";
import {ObjectId} from "mongodb";
import {checkIsProperID} from "@/validation";

export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const {id} = await params;
    const workoutId = checkIsProperID(id, "Workout ID");
    const workoutCollection = await workouts();

    const workout = await workoutCollection.findOne({
      _id: new ObjectId(workoutId),
    });

    if (!workout) {
      return NextResponse.json({error: "Workout not found"}, {status: 404});
    }

    // Full workout including exercises with _id and sets
    return NextResponse.json(workout, {status: 200});
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}

export async function DELETE(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const {id} = await params;
    const workoutId = checkIsProperID(id, "Workout ID");

    const workoutCollection = await workouts();
    const result = await workoutCollection.deleteOne({
      _id: new ObjectId(workoutId),
    });

    if (result.deletedCount === 0 || result.acknowledged === false) {
      return NextResponse.json({error: "Workout not found"}, {status: 404});
    }

    return NextResponse.json(
      {message: "Workout deleted successfully"},
      {status: 200}
    );
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}
