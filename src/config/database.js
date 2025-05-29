import {mongoose} from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Liftly",
    });
    console.log("Mongoose Connected");
  } catch (e) {
    console.log(e);
  }
};
