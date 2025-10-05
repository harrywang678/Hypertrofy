import {NextRequest, NextResponse} from "next/server";
import {users} from "@/config/mongoCollections";
import {createPasswordResetToken} from "@/lib/passwordReset";
import {sendPasswordResetEmail} from "@/config/emailService";

/**
 * Interface for the request body
 */
interface ForgotPasswordRequest {
  email: string;
}

/**
 * Interface for user document (adjust based on your schema)
 */
interface UserDocument {
  _id: any; // ObjectId from MongoDB
  email: string;
  name?: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body with type assertion
    const body = (await request.json()) as ForgotPasswordRequest;
    const {email} = body;

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {error: "Valid email is required"},
        {status: 400}
      );
    }

    // Find the user
    const usersCollection = await users();
    const user = (await usersCollection.findOne({
      email: email.toLowerCase(),
    })) as UserDocument | null;

    // SECURITY: Don't reveal if email exists or not
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: "If that email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const {token} = await createPasswordResetToken(user._id.toString());

    // Send email
    await sendPasswordResetEmail(user.email, token, user.name || "User");

    return NextResponse.json({
      message: "If that email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {error: "An error occurred. Please try again."},
      {status: 500}
    );
  }
}
