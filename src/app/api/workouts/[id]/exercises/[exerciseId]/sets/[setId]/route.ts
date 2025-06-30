import {NextResponse} from "next/server";
import {workouts} from "@/config/mongoCollections";
import {ObjectId} from "mongodb";
import * as validation from "@/validation";

export async function DELETE(
  req: Request,
  {params}: {params: {id: string; exerciseId: string; setId: string}}
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
