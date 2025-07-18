import {routines} from "../config/mongoCollections";
import {ObjectId, ReturnDocument} from "mongodb";
import * as validation from "../validation";

interface Routine {
  _id: ObjectId;
  name: string;
  userId: ObjectId;
  exercises: {
    exerciseId: ObjectId;
    sets: number;
  }[];
}

export async function createRoutine(
  name: string,
  userId: string,
  exercises: {
    exerciseId: string;
    sets: number;
  }[]
) {
  try {
    name = validation.checkIsProperString(name, "name");
    userId = validation.checkIsProperID(userId, "userId");
    if (!Array.isArray(exercises) || exercises.length === 0) {
      throw new Error("exercises must be a non-empty array");
    }
    exercises.forEach((exercise) => {
      if (
        !exercise ||
        typeof exercise.exerciseId !== "string" ||
        typeof exercise.sets !== "number" ||
        exercise.sets <= 0
      ) {
        throw new Error("Each exercise must have a valid exerciseId and sets");
      }
      exercise.exerciseId = validation.checkIsProperID(
        exercise.exerciseId,
        "exerciseId"
      );
    });

    const routineCollection = await routines();

    const newRoutine = {
      name,
      userId: new ObjectId(userId),
      exercises: exercises.map((exercise) => ({
        exerciseId: new ObjectId(exercise.exerciseId),
        sets: exercise.sets,
      })),
      createdAt: new Date(),
    };

    const insertInfo = await routineCollection.insertOne(newRoutine);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw new Error("Could not add routine");
    }

    const newId = insertInfo.insertedId;
    const routine = await routineCollection.findOne({
      _id: newId,
    });

    return routine as Routine;
  } catch (err: any) {
    throw new Error(`Error creating routine: ${err.message}`);
  }
}

export const getRoutineById = async (id: string): Promise<Routine> => {
  try {
    id = validation.checkIsProperID(id, "routineId");

    const routineCollection = await routines();

    const routine = await routineCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!routine) {
      throw new Error(`No routine found with ID: ${id}`);
    }

    return routine as Routine;
  } catch (err: any) {
    throw new Error(`Error retrieving routine by ID: ${err.message}`);
  }
};

export const getRoutineByUserId = async (
  userId: string
): Promise<Routine[]> => {
  try {
    userId = validation.checkIsProperID(userId, "userId");

    const routineCollection = await routines();

    const routinesList = await routineCollection
      .find({userId: new ObjectId(userId)})
      .toArray();

    if (!routinesList || routinesList.length === 0) {
      throw new Error(`No routines found for user ID: ${userId}`);
    }

    return routinesList as Routine[];
  } catch (e: any) {
    throw new Error(`Error retrieving routines by user ID: ${e.message}`);
  }
};

export const getAllRoutines = async (): Promise<Routine[]> => {
  try {
    const routineCollection = await routines();

    const allRoutines = await routineCollection.find({}).toArray();

    if (!allRoutines || allRoutines.length === 0) {
      throw new Error("No routines found");
    }

    return allRoutines as Routine[];
  } catch (err: any) {
    throw new Error(`Error retrieving all routines: ${err.message}`);
  }
};

export const updateRoutine = async (
  routineId: string,
  updatedFields: {
    name?: string;
    userId?: string;
    exercises?: {
      exerciseId: string;
      sets: number;
    }[];
  }
): Promise<Routine> => {
  try {
    routineId = validation.checkIsProperID(routineId, "routineId");
    if (updatedFields.name) {
      updatedFields.name = validation.checkIsProperString(
        updatedFields.name,
        "name"
      );
    }

    if (updatedFields.userId) {
      updatedFields.userId = validation.checkIsProperID(
        updatedFields.userId,
        "userId"
      );
    }

    if (updatedFields.exercises) {
      if (
        !Array.isArray(updatedFields.exercises) ||
        updatedFields.exercises.length === 0
      ) {
        throw new Error("exercises must be a non-empty array");
      }
      updatedFields.exercises.forEach((exercise) => {
        if (
          !exercise ||
          typeof exercise.exerciseId !== "string" ||
          typeof exercise.sets !== "number" ||
          exercise.sets <= 0
        ) {
          throw new Error(
            "Each exercise must have a valid exerciseId and sets"
          );
        }
        exercise.exerciseId = validation.checkIsProperID(
          exercise.exerciseId,
          "exerciseId"
        );
      });
    }

    const routineCollection = await routines();

    const updateInfo = await routineCollection.findOneAndUpdate(
      {_id: new ObjectId(routineId)},
      {$set: updatedFields},
      {returnDocument: "after"}
    );

    if (!updateInfo) {
      throw new Error("Could not update routine");
    }

    return updateInfo as Routine;
  } catch (err: any) {
    throw new Error(`Error updating routine: ${err.message}`);
  }
};

export const deleteRoutine = async (id: string): Promise<Routine> => {
  try {
    id = validation.checkIsProperID(id, "routineId");

    const routineCollection = await routines();

    const deleteInfo = await routineCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (deleteInfo == null) {
      throw new Error(`No routine found with ID: ${id}`);
    }

    return deleteInfo as Routine;
  } catch (err: any) {
    throw new Error(`Error deleting routine: ${err.message}`);
  }
};
