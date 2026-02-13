import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from 'mongoose';

const connectDB = async () => {
          try {
                    await mongoose.connect(`${process.env.MONGO_URI}`)
                    console.log("mongoose connected")
          } catch (error) {
                    console.log("error:",error);
                    process.exit(1);
          }
}

export default connectDB