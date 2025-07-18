import {NextRequest, NextResponse} from "next/server";
import * as validation from "@/validation";
import {getRoutineById} from "@/data/routines";

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
