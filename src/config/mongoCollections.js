import {dbConnection} from "@/src/config/mongoConnection.js";
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

// list of collections
export const exercises = getCollectionFn("exercises");
export const sets = getCollectionFn("sets");
export const exerciseLogs = getCollectionFn("exerciseLogs");
export const workouts = getCollectionFn("workouts");
export const users = getCollectionFn("users");
