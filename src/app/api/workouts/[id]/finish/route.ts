import {NextResponse} from "next/server";
import {workouts} from "@/config/mongoCollections";
import {ObjectId} from "mongodb";
import * as validation from "@/validation";

export async function PATCH(req: Request, {params}: {params: {id: string}}) {
  try {
    let {id} = await params;

    console.log(id);

    let workoutId = validation.checkIsProperID(id);

    const workoutCollection = await workouts();

    const result = await workoutCollection.findOneAndUpdate(
      {_id: new ObjectId(workoutId)},
      {$set: {finished: true}},
      {returnDocument: "after"}
    );

    if (!result) {
      return NextResponse.json({error: "Workout not found"}, {status: 404});
    }

    return NextResponse.json(result); // updated workout
  } catch (err: any) {
    console.error("PATCH /finish error:", err);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
