const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    dueDate: { type: Date, required: true },
    isRead: { type: Boolean, default: false }, // ✅ Read Status
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
