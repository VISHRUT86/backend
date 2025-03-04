const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    annualGoal: { type: Number, default: 0 } // ✅ Add this field
});

// **Yahaan ensure kar rahe hain ki agar "User" model pehle se define hai toh usko reuse karein**
const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
