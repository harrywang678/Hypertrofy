import {ObjectId} from "mongodb";
import {workouts, users, routines} from "@/config/mongoCollections";
import * as validation from "@/validation";

export const createWorkout = async (
  userId: string,
  name: string,
  notes?: string,
  routineId?: string
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

    const workoutExercises = routineId
      ? await getExercisesFromRoutine(routineId)
      : [];

    let newWorkout = {
      userId: new ObjectId(userId),
      date: new Date(),
      name,
      notes,
      exercises: workoutExercises,
      finished: false,
      startTime: new Date(), // needed for duration calculation
      duration: null,
    };

    const insertedWorkout = await workoutCollection.insertOne(newWorkout);

    if (!insertedWorkout.acknowledged || !insertedWorkout.insertedId)
      throw new Error("Could not create new workout.");

    newWorkout = {...(newWorkout as any), _id: insertedWorkout.insertedId};

    await userCollection.updateOne(
      {_id: new ObjectId(userId)},
      {$push: {workouts: insertedWorkout.insertedId}}
    );

    return newWorkout;
  } catch (e: any) {
    throw new Error(e);
  }
};

async function getExercisesFromRoutine(routineId: string) {
  routineId = validation.checkIsProperID(routineId, "routineId");
  const routineCollection = await routines();
  const routine = await routineCollection.findOne({
    _id: new ObjectId(routineId),
  });
  if (!routine) throw new Error("Routine not found.");

  return (routine.exercises || []).map((ex: any) => ({
    _id: new ObjectId(),
    exerciseId: new ObjectId(ex.exerciseId ?? ex._id),
    name: ex.name,
    muscle: ex.muscle || "Unknown",
    equipment: ex.equipment || "Unknown",
    sets: Array.from({length: ex.sets?.length || 3}, (_, i) => ({
      _id: new ObjectId(),
      reps: 0,
      weight: 0,
      completed: false,
    })),
    notes: "",
  }));
}

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

export const addExerciseToWorkout = async (
  workoutId: string,
  exerciseData: {
    exerciseId: string;
    name: string;
    muscle: string;
    equipment: string;
  }
) => {
  try {
    workoutId = validation.checkIsProperID(workoutId, "WorkoutId");

    // Validate and format input
    const exerciseToAdd = {
      _id: new ObjectId(), // Unique ID for this workout's exercise entry
      exerciseId: new ObjectId(exerciseData.exerciseId),
      name: validation.checkIsProperString(exerciseData.name, "Exercise Name"),
      muscle: validation.checkIsProperString(exerciseData.muscle, "Muscle"),
      equipment: validation.checkIsProperString(
        exerciseData.equipment,
        "Equipment"
      ),
      sets: [], // Start with empty sets array
    };

    const workoutCollection = await workouts();

    const updateResult = await workoutCollection.updateOne(
      {_id: new ObjectId(workoutId)},
      {$push: {exercises: exerciseToAdd}}
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to add exercise to workout.");
    }

    return exerciseToAdd; // return the added exercise with its _id
  } catch (e: any) {
    throw new Error(e.message || "Error adding exercise to workout.");
  }
};
