"use server";

import {registerUser, loginUser} from "@/data/users";

export async function registerUserAction(formData: FormData) {
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

export async function loginUserAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {error: "Please enter your Email and Passowrd."};
  }

  const result = await loginUser(email, password);

  if (result.error) {
    return {error: result.error};
  }

  return {sucess: true};
}
