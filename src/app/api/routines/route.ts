import {NextRequest, NextResponse} from "next/server";
import * as validation from "@/validation";
import {createRoutine} from "@/data/routines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {name, userId, exercises} = body;

    const routine = await createRoutine(name, userId, exercises);

    return NextResponse.json(routine, {status: 201});
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}
