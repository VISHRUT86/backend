const Notification = require("../Models/Notification");

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ isRead: false }).sort({ createdAt: -1 });

        // ✅ Mark all notifications as read
        await Notification.updateMany({ isRead: false }, { isRead: true });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
