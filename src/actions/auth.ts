"use server";

import {registerUser} from "@/data/users";

export async function registerUserAction(formData: FormData) {
  console.log("ACTION REACHED");
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!firstName || !lastName || !email || !password) {
    return {error: "All fields are required."};
  }
  const result = await registerUser(
    `${firstName}`,
    `${lastName}`,
    email,
    password
  );

  if (result.error) {
    return {error: result.error};
  }

  return {success: true};
}
