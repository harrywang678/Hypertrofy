import {NextRequest, NextResponse} from "next/server";
import {workouts} from "@/config/mongoCollections";
import {ObjectId} from "mongodb";
import * as validation from "@/validation";

export async function DELETE(
  req: NextRequest,
  {params}: {params: Promise<{id: string; exerciseId: string; setId: string}>}
) {
  try {
    let {id: workoutId, exerciseId, setId} = await params;

    console.log("setId:", setId);
    workoutId = validation.checkIsProperID(workoutId);
    exerciseId = validation.checkIsProperID(exerciseId);
    setId = validation.checkIsProperID(setId);

    const workoutCollection = await workouts();

    const result = await workoutCollection.findOneAndUpdate(
      {_id: new ObjectId(workoutId), "exercises._id": new ObjectId(exerciseId)},
      {
        $pull: {
          "exercises.$.sets": {_id: new ObjectId(setId)},
        },
      },
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

export async function PATCH(
  req: Request,
  {params}: {params: Promise<{id: string; exerciseId: string; setId: string}>}
) {
  try {
    let {id: workoutId, exerciseId, setId} = await params;

    workoutId = validation.checkIsProperID(workoutId);
    exerciseId = validation.checkIsProperID(exerciseId);
    setId = validation.checkIsProperID(setId);

    const {completed} = await req.json();

    if (typeof completed !== "boolean") {
      return NextResponse.json(
        {error: "Completed status must be a boolean."},
        {status: 400}
      );
    }

    const workoutCollection = await workouts();

    const result = await workoutCollection.findOneAndUpdate(
      {
        _id: new ObjectId(workoutId),
        "exercises._id": new ObjectId(exerciseId),
        "exercises.sets._id": new ObjectId(setId),
      },
      {
        $set: {
          "exercises.$[ex].sets.$[set].completed": completed,
        },
      },
      {
        arrayFilters: [
          {"ex._id": new ObjectId(exerciseId)},
          {"set._id": new ObjectId(setId)},
        ],
        returnDocument: "after",
      }
    );

    if (!result) {
      return NextResponse.json(
        {error: "Workout, exercise, or set not found."},
        {status: 404}
      );
    }

    return NextResponse.json({success: true});
  } catch (err: any) {
    console.error("PATCH set error:", err);
    return NextResponse.json({error: "Internal server error."}, {status: 500});
  }
}
