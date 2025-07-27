import {ObjectId} from "mongodb";

export interface WorkoutSet {
  _id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  _id: string;
  exerciseId: string;
  name: string;
  muscle: string;
  equipment: string;
  sets?: WorkoutSet[];
  finished: boolean;
}

export interface Workout {
  _id: string;
  exercises: Exercise[];
  finished: boolean;
  duration?: number;
  userId: string | ObjectId;
  startTime: Date;
  date: Date;
  name: string;
  notes?: string;
}

export interface Routine {
  _id: string | ObjectId;
  name: string;
  userId: string | ObjectId;
  exercises: Exercise[];
  createdAt: Date;
}
