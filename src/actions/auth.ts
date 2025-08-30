// actions/auth.ts
"use server";

import {registerUser} from "@/data/users";

export async function registerUserAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const profilePictureFile = formData.get("profilePicture") as File | null;

  if (!firstName || !lastName || !email || !password) {
    return {error: "All required fields must be filled."};
  }

  let profilePictureData = "";

  // Handle profile picture if provided
  if (profilePictureFile && profilePictureFile.size > 0) {
    // Validate file type
    if (!profilePictureFile.type.startsWith("image/")) {
      return {error: "Profile picture must be an image file."};
    }

    // Validate file size (5MB limit)
    if (profilePictureFile.size > 5 * 1024 * 1024) {
      return {error: "Profile picture must be less than 5MB."};
    }

    try {
      // Option 1: Convert to base64 string for database storage
      const bytes = await profilePictureFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      profilePictureData = `data:${
        profilePictureFile.type
      };base64,${buffer.toString("base64")}`;
    } catch (error) {
      console.error("Error processing profile picture:", error);
      return {error: "Failed to process profile picture."};
    }
  }

  const result = await registerUser(
    firstName,
    lastName,
    email,
    password,
    profilePictureData
  );

  if (result.error) {
    return {error: result.error || "Unknown error occurred"};
  }

  return {success: true};
}
