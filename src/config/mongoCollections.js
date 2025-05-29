import {dbConnection} from "@/config/mongoConnection.js";
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
export const users = getCollectionFn("users");
