import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { workouts } from "@/config/mongoCollections";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workoutsCollection = await workouts();

    // Find the most recent unfinished workout for the user
    const unfinishedWorkout = await workoutsCollection
      .findOne(
        { 
          userId: new ObjectId(session.user.id), 
          finished: { $ne: true } // Get workouts that are not finished
        },
        { 
          sort: { createdAt: -1 } // Sort by creation date, newest first
        }
      );

    if (!unfinishedWorkout) {
      return NextResponse.json(
        { error: "No unfinished workout found" },
        { status: 404 }
      );
    }

    return NextResponse.json(unfinishedWorkout, { status: 200 });
  } catch (error: any) {
    console.error("API Error:", error.message);
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
} 
