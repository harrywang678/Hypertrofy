import {ObjectId} from "mongodb";

export interface ExerciseSet {
  repetition: number;
  weight: number;
}

export interface Exercise {
  _id: string | ObjectId;
  name: string;
  category: string;
  equipment: string;
  isUserCreated: boolean;
  userId?: ObjectId;
}

export interface ExerciseLog {
  _id: ObjectId;
  userId: ObjectId;
  workoutId: ObjectId;
  exerciseId: ObjectId;
  sets: ExerciseSet[];
  order: number;
}

export interface Workout {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  date: Date;
  notes?: string;
  exerciseLogs: ObjectId[]; // array of ExerciseLog IDs
  createdAt: Date;
}

export interface User {
  _id: string | ObjectId;
  name: string;
  email: string;
  password: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  friends: Friend[];
}

export interface Friend {
  userId: ObjectId | string;
  status: "acceptRequest" | "pending" | "friend";
}
