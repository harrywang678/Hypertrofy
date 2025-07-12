import {ObjectId} from "mongodb";
import {users} from "@/config/mongoCollections.js";
import * as redis from "redis";
import {
  Workout,
  ExerciseLog,
  ExerciseSet,
  Exercise,
  User,
} from "@/types/fitness";
import * as validation from "@/validation";
import bcrypt from "bcryptjs";

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{
  signupComplete: boolean;
  user?: Omit<User, "password">;
  error?: Error;
}> => {
  try {
    firstName = validation.isValidName(firstName, "First Name");
    lastName = validation.isValidName(lastName, "Last Name");
    email = validation.checkIsProperEmail(email, "Email");
    password = validation.checkIsProperPassword(password, "Password");
    const saltRounds = 3;
    const hash = await bcrypt.hash(password, saltRounds);
    const createdAt = new Date();
    const updatedAt = new Date();

    const userCollection = await users();
    const alreadyAUser = await userCollection.findOne({
      email: email.toLowerCase(),
    });

    if (alreadyAUser) {
      throw new Error("There is a already an account with this Email.");
    }

    const newUser: Omit<User, "_id"> = {
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hash,
      createdAt,
      updatedAt,
      friends: [],
    };

    const insertUser = await userCollection.insertOne(newUser);
    if (!insertUser.acknowledged || !insertUser.insertedId) {
      throw new Error("Server Error: Could not create new user.");
    }

    const createdUser = await userCollection.findOne({
      _id: insertUser.insertedId,
    });

    const {password: _pass, ...userWithoutPassword} = createdUser;
    const completedUserWithoutPassword: Omit<User, "password"> = {
      ...userWithoutPassword,
    };

    return {signupComplete: true, user: completedUserWithoutPassword as User};
  } catch (e: any) {
    console.log(e);
    return {signupComplete: false, error: e};
  }
};
export const loginUser = async (
  email: string,
  password: string
): Promise<{
  loginComplete: boolean;
  user?: Omit<User, "password">;
  error?: Error;
}> => {
  try {
    email = validation.checkIsProperEmail(email, "Email");
    password = validation.checkIsProperPassword(password, "Password");

    const userCollection = await users();

    const userExists = await userCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!userExists)
      throw new Error("Either the email or password is invalid.");

    const passwordCrypt = await bcrypt.compare(password, userExists.password);

    if (!passwordCrypt)
      throw new Error("Either the email or password is invalid.");

    const {password: _pass, _id, ...userWithoutPassword} = userExists;
    const completedUserWithoutPassword: Omit<User, "password"> = {
      ...userWithoutPassword,
      _id: _id.toString(),
    };

    return {loginComplete: true, user: completedUserWithoutPassword};
  } catch (e: any) {
    return {loginComplete: false, error: e};
  }
};
