import {exercises} from "@/config/mongoCollections";
import {closeConnection} from "@/config/mongoConnection";
import dotenv from "dotenv";

dotenv.config({path: ".env.local"});
console.log("UUsing MongoDB URI:", process.env.MONGODB_URI);

const defaultExercises = [
  {
    name: "Lat Pulldown",
    muscle: "Lats",
    equipment: "Cable",
    userMade: false,
  },
  {
    name: "Bench Press",
    muscle: "Chest",
    equipment: "Barbell",
    userMade: false,
  },
  {
    name: "Squat",
    muscle: "Quads",
    equipment: "Barbell",
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
