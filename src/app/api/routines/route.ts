import {NextRequest, NextResponse} from "next/server";
import * as validation from "@/validation";
import {createRoutine} from "@/data/routines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {name, userId, exercises} = body;
    name = validation.checkIsProperString(name, "Routine name");
    userId = validation.checkIsProperID(userId, "User ID");
    if (!Array.isArray(exercises) || exercises.length === 0) {
      throw new Error("exercises must be a non-empty array");
    }
    exercises.forEach((exercise) => {
      if (
        !exercise ||
        typeof exercise.exerciseId !== "string" ||
        typeof exercise.sets !== "number" ||
        exercise.sets <= 0
      ) {
        throw new Error("Each exercise must have a valid exerciseId and sets");
      }
      exercise.exerciseId = validation.checkIsProperID(
        exercise.exerciseId,
        "exerciseId"
      );
    });

    const routine = await createRoutine(name, userId, exercises);

    return NextResponse.json(routine, {status: 201});
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}
