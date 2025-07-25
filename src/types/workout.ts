export interface WorkoutSet {
  _id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  _id: string;
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
}
