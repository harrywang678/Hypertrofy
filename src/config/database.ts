// config/database.ts
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = "Liftly";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let db: Db;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function connectDB(): Promise<Db> {
  if (!db) {
    const client = await clientPromise;
    db = client.db(dbName);
    console.log("MongoDB Connected");
  }
  return db;
}
