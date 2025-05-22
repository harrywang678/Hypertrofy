import {ObjectId} from "mongodb";

export interface Set {
  repetition: number;
  weight: number;
}

export interface Exercise {
  _id: string | ObjectId;
  name: string;
  category: string;
  equipment: string;
  isUserCreated: boolean;
  userId?: string;
}

export interface ExerciseLog {
  _id: string | ObjectId;
  userId: string;
  workoutId: string;
  exerciseId: string;
  sets: Set[];
  order: number;
}

export interface Workout {
  _id: string | ObjectId;
  userId: string;
  name: string;
  date: Date;
  notes?: string;
  exercises: string[]; // array of ExerciseLog IDs
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
