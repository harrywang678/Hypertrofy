import {passwordResetToken} from "./mongoCollections";

/**
 * Sets up database indexes for optimal performance and automatic cleanup
 */
export async function setupDatabaseIndexes(): Promise<void> {
  const tokenCollection = await passwordResetToken();

  // TTL index: MongoDB automatically deletes expired documents
  // Documents are deleted when expiresAt < current time
  await tokenCollection.createIndex({expiresAt: 1}, {expireAfterSeconds: 0});

  // Index for faster token lookups
  await tokenCollection.createIndex({token: 1});

  console.log("Database indexes created successfully");
}
