import {NextRequest, NextResponse} from "next/server";
import * as validation from "@/validation";
import {getRoutineByUserId} from "@/data/routines";

export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    let {id} = await params;

    let userId = validation.checkIsProperID(id, "User ID");

    const routine = await getRoutineByUserId(userId);

    if (!routine) {
      return NextResponse.json(
        {error: `Routines not found for ${userId}`},
        {status: 404}
      );
    }

    return NextResponse.json(routine, {status: 200});
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}
