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
    const workoutCollection = await workouts();

    const userFound = await userCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (!userFound)
      throw new Error("User Not Found, can not make new workout.");

    let newWorkout = {
      userId,
      name,
      notes,
    };

    const insertedWorkout = await workoutCollection.insertOne(newWorkout);

    if (!insertedWorkout.acknowledged || !insertedWorkout.insertedId)
      throw new Error("Could not create new workout.");

    await userCollection.updateOne(
      {_id: new ObjectId(userId)},
      {$push: {workouts: insertedWorkout.insertedId}}
    );

    newWorkout = {...(newWorkout as any), _id: insertedWorkout.insertedId};

    return newWorkout;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getWorkoutById = async (id: string) => {
  try {
    id = validation.checkIsProperID(id, "WorkoutId");
    const workoutCollection = await workouts();

    const workout = await workoutCollection.findOne({_id: new ObjectId(id)});

    if (!workout) throw new Error("Workout not Found.");

    return workout;
  } catch (e: any) {
    throw new Error(e.message || "Unknown error");
  }
};
