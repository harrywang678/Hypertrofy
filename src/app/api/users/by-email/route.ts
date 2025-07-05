import {NextResponse} from "next/server";
import {users} from "@/config/mongoCollections"; // adjust if your DB accessor is named differently

export async function POST(req: Request) {
  try {
    const {email} = await req.json();
    if (!email) {
      return NextResponse.json({error: "Email is required"}, {status: 400});
    }

    const userCollection = await users();
    const user = await userCollection.findOne({email});

    if (!user) {
      return NextResponse.json({error: "User not found"}, {status: 404});
    }

    return NextResponse.json({user});
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
