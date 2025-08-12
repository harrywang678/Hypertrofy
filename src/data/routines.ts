import {routines} from "../config/mongoCollections";
import {ObjectId, ReturnDocument} from "mongodb";
import * as validation from "../validation";
import {Exercise, Routine, WorkoutSet} from "@/types/workout";

export async function createRoutine(
  name: string,
  userId: string,
  exercises: Exercise[]
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
        typeof exercise.muscle !== "string" ||
        typeof exercise.equipment !== "string" ||
        typeof exercise.exerciseId !== "string" ||
        typeof exercise.name !== "string" ||
        !Array.isArray(exercise.sets) ||
        exercise.sets.length === 0
      ) {
        throw new Error(
          "Each exercise must have a valid exerciseId, exercise name, and sets array"
        );
      }

      exercise.exerciseId = validation.checkIsProperID(
        exercise.exerciseId,
        "exerciseId"
      );

      exercise.sets.forEach((set, index) => {
        if (
          typeof set.reps !== "number" ||
          typeof set.weight !== "number" ||
          typeof set.completed !== "boolean"
        ) {
          throw new Error(
            `Invalid set at index ${index} for exercise ${exercise.name}`
          );
        }
      });
    });

    const routineCollection = await routines();

    const newRoutine = {
      name,
      userId: new ObjectId(userId),
      exercises: exercises.map((exercise) => ({
        muscle: exercise.muscle,
        equipment: exercise.equipment,
        name: exercise.name,
        exerciseId: new ObjectId(exercise.exerciseId),
        sets: exercise?.sets?.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
        })),
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
      name: string;
      muscle: string;
      equipment: string;
      sets?: number | WorkoutSet[];
    }[];
  }
): Promise<Routine> => {
  try {
    // Validate routineId
    routineId = validation.checkIsProperID(routineId, "routineId");

    // Build the update object
    const updateDoc: Partial<Routine> = {};

    // Validate and assign name
    if (updatedFields.name) {
      updateDoc.name = validation.checkIsProperString(
        updatedFields.name,
        "name"
      );
    }

    // Validate and assign userId
    if (updatedFields.userId) {
      updateDoc.userId = validation.checkIsProperID(
        updatedFields.userId,
        "userId"
      );
    }

    // Validate and map exercises
    if (updatedFields.exercises) {
      if (
        !Array.isArray(updatedFields.exercises) ||
        updatedFields.exercises.length === 0
      ) {
        throw new Error("exercises must be a non-empty array");
      }

      console.log("UpdatedFields", updatedFields);
      updateDoc.exercises = updatedFields?.exercises.map((exercise, index) => {
        if (
          !exercise.exerciseId ||
          !exercise.name ||
          !exercise.muscle ||
          !exercise.equipment
        ) {
          throw new Error(
            `Exercise at index ${index} is missing required fields`
          );
        }

        const validExerciseId = validation.checkIsProperID(
          exercise.exerciseId,
          "exerciseId"
        );

        let processedSets: WorkoutSet[] | undefined;

        if (typeof exercise.sets === "number") {
          if (exercise.sets <= 0) {
            throw new Error(
              `Exercise at index ${index} has invalid sets number`
            );
          }

          processedSets = Array(exercise.sets)
            .fill(0)
            .map(() => ({
              _id: new ObjectId().toString(),
              reps: 0,
              weight: 0,
              completed: false,
            }));
        } else if (Array.isArray(exercise.sets)) {
          processedSets = exercise.sets.map((set, setIdx) => {
            if (
              typeof set.reps !== "number" ||
              typeof set.weight !== "number" ||
              typeof set.completed !== "boolean"
            ) {
              throw new Error(
                `Invalid set at index ${setIdx} in exercise ${index}`
              );
            }

            return {
              _id: set._id || new ObjectId().toString(),
              reps: set.reps,
              weight: set.weight,
              completed: set.completed,
            };
          });
        }

        return {
          _id: new ObjectId().toString(), // optional, depends on your schema
          exerciseId: validExerciseId,
          name: exercise.name,
          muscle: exercise.muscle,
          equipment: exercise.equipment,
          sets: processedSets,
          finished: false,
        };
      });
    }

    const routineCollection = await routines();

    const result = await routineCollection.findOneAndUpdate(
      {_id: new ObjectId(routineId)},
      {$set: updateDoc},
      {returnDocument: "after"}
    );

    if (!result) {
      throw new Error("Could not find or update routine");
    }

    return result as Routine;
  } catch (err: any) {
    throw new Error(`Error updating routine: ${err.message}`);
  }
};

export const deleteRoutineById = async (id: string): Promise<Routine> => {
  try {
    id = validation.checkIsProperID(id, "routineId");

    const routineCollection = await routines();

    console.log("RoutineId:", id);

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
