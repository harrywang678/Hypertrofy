import {IntegerType, ObjectId} from "mongodb";
import {exercises, workouts} from "@/config/mongoCollections.js";
import * as redis from "redis";
import * as validation from "@/validation";

export const createExercise = async (
  name: string,
  muscle: string,
  equipment: string,
  userMade: boolean,
  userId?: string
) => {
  try {
    name = validation.checkIsProperString(name, "Exercise Name");
    muscle = validation.checkIsProperString(muscle, "Muscle Part");
    muscle = validation.validateMuscleGroup(muscle);
    equipment = validation.checkIsProperString(equipment, "Equipment");
    equipment = validation.validateEquipment(equipment);
    if (typeof userMade != "boolean")
      throw new Error("usedMade needs to be a boolean");
    if (userId) {
      userId = validation.checkIsProperID(userId, "userId");
    }

    const exerciseCollection = await exercises();

    const newExercise: any = {
      name,
      muscle,
      equipment,
      userMade,
      ...(userId && {userId}),
    };

    const result = await exerciseCollection.insertOne(newExercise);

    if (!result.acknowledged || !result.insertedId) {
      console.log(result.acknowledged);
      throw new Error("Could not make new Exercise.");
    }

    return newExercise;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getAllDefaultExercises = async () => {
  try {
    const exerciseCollection = await exercises();

    const allDefaultExercises = await exerciseCollection
      .find({userMade: false})
      .toArray();

    if (!allDefaultExercises)
      throw new Error("Can not find default exercises.");
    return allDefaultExercises;
  } catch (e: any) {
    console.error("Error fetching default exercises:", e);
    throw new Error(e);
  }
};

export const getExerciseById = async (id: string) => {
  try {
    id = validation.checkIsProperID(id, "getExercisebyId: id");
    const exerciseCollection = await exercises();

    const exercise = await exerciseCollection.findOne({_id: new ObjectId(id)});

    if (!exercise) throw new Error("Can not find exercise.");

    return exercise;
  } catch (e: any) {
    console.error("Error fetching exercise by id: ", e);
    throw new Error(e);
  }
};
