// app/api/test-user/route.ts
import {loginUser} from "@/data/users";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
  const {email, password} = await request.json();
  const user = await loginUser(email, password);
  return NextResponse.json({user});
}
