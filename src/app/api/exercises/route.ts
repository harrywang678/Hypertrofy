import {NextResponse, NextRequest} from "next/server";
import {createExercise} from "@/data/exercises";
import * as validation from "@/validation";

export async function POST(req: NextRequest) {
  try {
    let {name, muscle, equipment, userMade, userId} = await req.json();

    // Validate required fields
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {error: "name is required and must be a string."},
        {status: 400}
      );
    }

    try {
      muscle = validation.validateMuscleGroup(muscle);
      equipment = validation.validateEquipment(equipment);
    } catch (e: any) {
      return NextResponse.json({error: e.message}, {status: 400});
    }

    // Optional field: userId
    if (userId && typeof userId !== "string") {
      return NextResponse.json(
        {error: "userId must be a string if provided."},
        {status: 400}
      );
    }

    const newExercise = await createExercise(name, muscle, equipment, userMade);

    return NextResponse.json(
      {success: true, exercise: newExercise},
      {status: 201}
    );
  } catch (error: any) {
    console.error("API Error:", error.message);
    console.log(error);
    return NextResponse.json(
      {error: error.message ?? "Internal Server Error"},
      {status: 500}
    );
  }
}
