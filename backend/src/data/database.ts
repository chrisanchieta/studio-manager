import mongoose from "mongoose";

export const connectToDatabase = async (): Promise<void> => {
  const DATABASE_URI = process.env.DATABASE_URI;

  if (!DATABASE_URI) {
    throw new Error("DATABASE_URI environment variable is not defined");
  }

  try {
    await mongoose.connect(DATABASE_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      autoIndex: process.env.NODE_ENV !== "production",
    });

    console.log("✅ MongoDB connected successfully");

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting MongoDB:", error);
  }
};