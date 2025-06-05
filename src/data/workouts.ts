import {ObjectId} from "mongodb";
import {workouts, users} from "@/config/mongoCollections";
import {
  Workout,
  ExerciseLog,
  ExerciseSet,
  Exercise,
  User,
} from "@/types/fitness";
import * as validation from "@/validation";

export const createWorkout = async (
  userId: string,
  name: string,
  notes?: string
) => {
  try {
    userId = validation.checkIsProperID(userId, "userId");
    name = validation.checkIsProperString(name, "workoutName");
    if (notes) {
      notes = validation.checkIsProperString(notes, "notes");
    }

    const userCollection = await users();
  } catch (e) {}
};

export const getWorkoutById = async (id: ObjectId | string) => {};
