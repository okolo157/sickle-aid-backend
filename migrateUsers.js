require('dotenv').config(); // Load environment variables from .env file
const mongoose = require("mongoose");

// Use environment variable for MongoDB URI
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MONGO_URI is not defined in the environment variables.");
  process.exit(1); // Exit the process if URI is not defined
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model("User", new mongoose.Schema({ username: String }));

async function migrateUsers() {
  try {
    const result = await User.updateMany({}, { $unset: { username: "" } });
    console.log("Migration successful:", result);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.disconnect();
  }
}

migrateUsers();