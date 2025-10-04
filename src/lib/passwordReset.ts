// Helper Functions For Token Management

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

function generateResetToken(): string {
  // crypto.randomBytes(32) creates 32 random bytes
  // .toString('hex') converts to hexadecimal string
  return crypto.randomBytes(32).toString("hex");
}
