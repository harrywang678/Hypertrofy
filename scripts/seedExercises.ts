import {exercises} from "@/config/mongoCollections";
import {closeConnection} from "@/config/mongoConnection";
import dotenv from "dotenv";

dotenv.config({path: ".env.local"});
console.log("UUsing MongoDB URI:", process.env.MONGODB_URI);

const defaultExercises = [
  {
    name: "Incline Bench Press",
    muscle: "Chest (Upper)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Incline Dumbbell Press",
    muscle: "Chest (Upper)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Incline Cable Fly",
    muscle: "Chest (Upper)",
    equipment: "Cable",
    userMade: false,
  },

  // Mid Chest
  {
    name: "Bench Press",
    muscle: "Chest (Mid)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Push-Up",
    muscle: "Chest (Mid)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Chest Fly",
    muscle: "Chest (Mid)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Machine Chest Press",
    muscle: "Chest (Mid)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Pec Deck Machine",
    muscle: "Chest (Mid)",
    equipment: "Machine",
    userMade: false,
  },

  // Lower Chest
  {
    name: "Decline Bench Press",
    muscle: "Chest (Lower)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Dips (Chest Leaning)",
    muscle: "Chest (Lower)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Dumbbell Pullover",
    muscle: "Chest (Lower)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Lat Pulldown",
    muscle: "Back (Lats)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Pull-Up",
    muscle: "Back (Lats)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Chin-Up",
    muscle: "Back (Lats)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Straight-Arm Pulldown",
    muscle: "Back (Lats)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "One-Arm Dumbbell Row",
    muscle: "Back (Lats)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Barbell Row",
    muscle: "Back (Lats)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Dumbbell Pullover",
    muscle: "Back (Lats)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Seal Row",
    muscle: "Back (Lats)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Cable Row (Close Grip)",
    muscle: "Back (Lats)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Hammer Strength Lat Pulldown",
    muscle: "Back (Lats)",
    equipment: "Machine",
    userMade: false,
  },

  // Upper Back
  {
    name: "Face Pull",
    muscle: "Back (Upper)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Reverse Pec Deck Fly",
    muscle: "Back (Upper)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Bent-Over Rear Delt Raise",
    muscle: "Back (Upper)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Incline Bench Rear Delt Raise",
    muscle: "Back (Upper)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "T-Bar Row",
    muscle: "Back (Upper)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Machine Rear Delt Fly",
    muscle: "Back (Upper)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Cable Rear Delt Fly",
    muscle: "Back (Upper)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Inverted Row",
    muscle: "Back (Upper)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Chest-Supported Row",
    muscle: "Back (Upper)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Incline Prone Rear Delt Raise",
    muscle: "Back (Upper)",
    equipment: "Dumbbell",
    userMade: false,
  },

  // Traps
  {
    name: "Barbell Shrugs",
    muscle: "Back (Traps)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Dumbbell Shrugs",
    muscle: "Back (Traps)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Cable Shrugs",
    muscle: "Back (Traps)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Farmer's Walk",
    muscle: "Back (Traps)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Upright Row",
    muscle: "Back (Traps)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Trap Bar Shrugs",
    muscle: "Back (Traps)",
    equipment: "Trap Bar",
    userMade: false,
  },
  {
    name: "Power Shrug",
    muscle: "Back (Traps)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Snatch-Grip High Pull",
    muscle: "Back (Traps)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Face Pull with Rope",
    muscle: "Back (Traps)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Overhead Shrug",
    muscle: "Back (Traps)",
    equipment: "Barbell",
    userMade: false,
  },

  {
    name: "Barbell Back Squat",
    muscle: "Legs (Quads)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Front Squat",
    muscle: "Legs (Quads)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Leg Press",
    muscle: "Legs (Quads)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Walking Lunges",
    muscle: "Legs (Quads)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Bulgarian Split Squat",
    muscle: "Legs (Quads)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Goblet Squat",
    muscle: "Legs (Quads)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Hack Squat",
    muscle: "Legs (Quads)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Step-Ups",
    muscle: "Legs (Quads)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Sissy Squat",
    muscle: "Legs (Quads)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Leg Extension",
    muscle: "Legs (Quads)",
    equipment: "Machine",
    userMade: false,
  },

  // Hamstrings
  {
    name: "Romanian Deadlift",
    muscle: "Legs (Hamstrings)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Lying Leg Curl",
    muscle: "Legs (Hamstrings)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Seated Leg Curl",
    muscle: "Legs (Hamstrings)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Glute-Ham Raise",
    muscle: "Legs (Hamstrings)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Nordic Hamstring Curl",
    muscle: "Legs (Hamstrings)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Good Mornings",
    muscle: "Legs (Hamstrings)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Single-Leg Romanian Deadlift",
    muscle: "Legs (Hamstrings)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Stiff-Leg Deadlift",
    muscle: "Legs (Hamstrings)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Cable Leg Curl",
    muscle: "Legs (Hamstrings)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Dumbbell Leg Curl on Bench",
    muscle: "Legs (Hamstrings)",
    equipment: "Dumbbell",
    userMade: false,
  },

  // Glutes
  {
    name: "Hip Thrust",
    muscle: "Legs (Glutes)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Glute Bridge",
    muscle: "Legs (Glutes)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Sumo Deadlift",
    muscle: "Legs (Glutes)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Cable Kickbacks",
    muscle: "Legs (Glutes)",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Bulgarian Split Squat",
    muscle: "Legs (Glutes)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Step-Ups",
    muscle: "Legs (Glutes)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Reverse Lunge",
    muscle: "Legs (Glutes)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Kettlebell Swing",
    muscle: "Legs (Glutes)",
    equipment: "Kettlebell",
    userMade: false,
  },
  {
    name: "Frog Pumps",
    muscle: "Legs (Glutes)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Cable Pull-Through",
    muscle: "Legs (Glutes)",
    equipment: "Cable",
    userMade: false,
  },

  // Calves
  {
    name: "Standing Calf Raise",
    muscle: "Legs (Calves)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Seated Calf Raise",
    muscle: "Legs (Calves)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Donkey Calf Raise",
    muscle: "Legs (Calves)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Single-Leg Calf Raise",
    muscle: "Legs (Calves)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Calf Press on Leg Press",
    muscle: "Legs (Calves)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Barbell Calf Raise",
    muscle: "Legs (Calves)",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Smith Machine Calf Raise",
    muscle: "Legs (Calves)",
    equipment: "Machine",
    userMade: false,
  },
  {
    name: "Jump Rope",
    muscle: "Legs (Calves)",
    equipment: "Bodyweight",
    userMade: false,
  },
  {
    name: "Farmer’s Walk on Toes",
    muscle: "Legs (Calves)",
    equipment: "Dumbbell",
    userMade: false,
  },
  {
    name: "Resistance Band Calf Raise",
    muscle: "Legs (Calves)",
    equipment: "Band",
    userMade: false,
  },
];

async function seed() {
  try {
    const exerciseCollection = await exercises();

    for (const ex of defaultExercises) {
      const exists = await exerciseCollection.findOne({name: ex.name});

      if (!exists) {
        await exerciseCollection.insertOne(ex);
        console.log(`✅ Inserted: ${ex.name}`);
      } else {
        console.log(`ℹ️ Already exists: ${ex.name}`);
      }
    }
  } catch (e) {
    console.error("❌ Seeding failed:", e);
  } finally {
    closeConnection();
  }
}

seed();
