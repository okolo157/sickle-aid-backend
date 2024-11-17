const mongoose = require("mongoose");

const uri =
  "mongodb+srv://okolodubem9:oFtOoSldOYgj705b@cluster0.npexh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model("User", new mongoose.Schema({ username: String }));

async function migrateUsers() {
  try {
    const result = await User.updateMany({}, { $unset: { username: "" } });
    console.log("Migration successful:", result);
    mongoose.disconnect();
  } catch (error) {
    console.error("Migration failed:", error);
    mongoose.disconnect();
  }
}

migrateUsers();

//run with node migrateusers.js