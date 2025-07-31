import {NextRequest, NextResponse} from "next/server";
import * as validation from "@/validation";
import {
  getRoutineById,
  deleteRoutineById,
  updateRoutine,
} from "@/data/routines";

export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const {id} = await params;

    const routineId = validation.checkIsProperID(id, "Routine ID");
    const routine = await getRoutineById(routineId);
    if (!routine) {
      return NextResponse.json({error: "Routine not found"}, {status: 404});
    }
    return NextResponse.json(routine, {status: 200});
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

    const routineId = validation.checkIsProperID(id, "Routine ID");

    const deleteInfo = await deleteRoutineById(routineId);

    return NextResponse.json(deleteInfo, {status: 200});
  } catch (e: Error | any) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const {id} = await params;
    const body = await req.json();

    const updatedRoutine = await updateRoutine(id, body);

    return NextResponse.json(updatedRoutine, {status: 200});
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {error: error.message || "Failed to update routine"},
      {status: 400}
    );
  }
}
