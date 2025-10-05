import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {users} from "@/config/mongoCollections";
import {verifyResetToken, invalidateResetToken} from "@/lib/passwordReset";
import {ObjectId} from "mongodb";

/**
 * Interface for the request body
 */
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResetPasswordRequest;
    const {token, newPassword} = body;

    // Validate inputs
    if (!token || !newPassword) {
      return NextResponse.json(
        {error: "Token and new password are required"},
        {status: 400}
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {error: "Password must be at least 8 characters"},
        {status: 400}
      );
    }

    // Verify the token
    const verification = await verifyResetToken(token);

    if (!verification) {
      return NextResponse.json(
        {error: "Invalid or expired reset token"},
        {status: 400}
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password
    const usersCollection = await users();
    await usersCollection.updateOne(
      {_id: new ObjectId(verification.userId)},
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    // Invalidate the token so it can't be reused
    await invalidateResetToken(token);

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {error: "An error occurred. Please try again."},
      {status: 500}
    );
  }
}
