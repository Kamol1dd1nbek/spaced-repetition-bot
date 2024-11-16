import mongoose from "mongoose";

const connectDB = async (connection) => {
  try {
    await mongoose.connect(connection);
    console.log("Successfully connected to database");
  } catch (error) {
    console.log("Error on connecting to database: ", error.message);
    process.exit(1);
  }
};

export default connectDB;
