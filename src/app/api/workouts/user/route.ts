import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth"; // path to your NextAuth config
import {workouts} from "@/config/mongoCollections"; // adjust to your DB utility
import {ObjectId} from "mongodb";
import {finished} from "stream";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  try {
    const workoutsCollection = await workouts();
    const userWorkouts = await workoutsCollection
      .find({userId: new ObjectId(session.user.id), finished: true})
      .toArray();

    return NextResponse.json(userWorkouts);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {error: "Failed to fetch workouts"},
      {status: 500}
    );
  }
}
