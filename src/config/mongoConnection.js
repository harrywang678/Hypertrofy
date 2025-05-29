import {MongoClient} from "mongodb";
import {mongoConfig, env} from "@/config/settings.js";

let _connection = undefined;
let _db = undefined;

const dbConnection = async () => {
  try {
    const mongoURI = env.MONGODB_URI || mongoConfig.serverUrl;
    if (!_connection) {
      _connection = await MongoClient.connect(mongoURI);
      _db = _connection.db(mongoConfig.database);
    }
    console.log("MongoDB Connected.");
    return _db;
  } catch (e) {
    console.log(e);
  }
};
const closeConnection = async () => {
  await _connection.close();
};

export {dbConnection, closeConnection};
