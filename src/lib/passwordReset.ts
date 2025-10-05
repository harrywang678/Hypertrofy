import crypto from "crypto";
import {passwordResetToken} from "@/config/mongoCollections";
import type {ObjectId} from "mongodb";

/**
 * Interface for password reset token document in MongoDB
 */
interface PasswordResetTokenDocument {
  _id?: ObjectId;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

/**
 * Return type for createPasswordResetToken
 */
interface CreateTokenResult {
  token: string;
}

/**
 * Return type for verifyResetToken
 */
interface VerifyTokenResult {
  userId: string;
}

/**
 * Generates a secure random token
 * Uses crypto for cryptographically secure randomness
 * @returns A 32-byte hex string (64 characters)
 */
function generateResetToken(): string {
  // crypto.randomBytes(32) creates 32 random bytes
  // .toString('hex') converts to hexadecimal string
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hashes a token before storing in database
 * IMPORTANT: Never store plain tokens in DB (security!)
 * @param token - The plain token
 * @returns Hashed token
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a password reset token for a user
 * @param userId - The user's ID
 * @returns Contains the plain token (to send via email)
 */
export async function createPasswordResetToken(
  userId: string
): Promise<CreateTokenResult> {
  const tokenCollection = await passwordResetToken();

  // Generate a plain token
  const plainToken = generateResetToken();

  // Hash it for storage (security best practice)
  const hashedToken = hashToken(plainToken);

  // Delete any existing tokens for this user
  // (User can only have one active reset token at a time)
  await tokenCollection.deleteMany({userId});

  // Create expiration time (1 hour from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Create the token document with proper typing
  const tokenDocument: Omit<PasswordResetTokenDocument, "_id"> = {
    userId,
    token: hashedToken, // Store hashed version
    createdAt: new Date(),
    expiresAt,
    used: false,
  };

  // Insert the token document
  await tokenCollection.insertOne(tokenDocument);

  // Return the plain token (this is what goes in the email)
  return {token: plainToken};
}

/**
 * Verifies if a reset token is valid
 * @param token - The plain token from the URL
 * @returns User ID if valid, null if invalid
 */
export async function verifyResetToken(
  token: string
): Promise<VerifyTokenResult | null> {
  const tokenCollection = await passwordResetToken();

  // Hash the incoming token to compare with stored hash
  const hashedToken = hashToken(token);

  // Find the token in database
  const tokenDoc = (await tokenCollection.findOne({
    token: hashedToken,
    used: false,
    expiresAt: {$gt: new Date()}, // Check it's not expired
  })) as PasswordResetTokenDocument | null;

  if (!tokenDoc) {
    return null; // Invalid or expired token
  }

  return {userId: tokenDoc.userId};
}

/**
 * Marks a token as used (after successful password reset)
 * @param token - The plain token
 */
export async function invalidateResetToken(token: string): Promise<void> {
  const tokenCollection = await passwordResetToken();
  const hashedToken = hashToken(token);

  await tokenCollection.updateOne({token: hashedToken}, {$set: {used: true}});
}
