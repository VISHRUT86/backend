const cron = require("node-cron");
const Bill = require("../Models/Bill");
const Notification = require("../Models/Notification");

const generateMessage = (bill) => {
    return `Your ${bill.category} bill of ₹${bill.amount} is due on ${bill.dueDate.toDateString()}. Please pay it soon.`;
};

// ✅ Har 1 minute me check karega
cron.schedule("*/1 * * * *", async () => {
    try {
        console.log("🔄 Checking for upcoming due bills...");

        const today = new Date();
        today.setHours(0, 0, 0, 0); // ✅ Sirf date compare ho, time ignore ho

        const twoDaysLater = new Date();
        twoDaysLater.setDate(today.getDate() + 2);
        twoDaysLater.setHours(23, 59, 59, 999); // ✅ Ensure full day range

        console.log(`🕵️ Checking bills due between: ${today.toDateString()} and ${twoDaysLater.toDateString()}`);

        // ✅ Sirf wahi bills fetch jo 2 din baad due hone wale hain
        const upcomingDueBills = await Bill.find({ 
            dueDate: { $gte: today, $lte: twoDaysLater }, 
            status: "Due"
        });

        console.log(`📝 Found ${upcomingDueBills.length} bills due in next 2 days`);

        if (upcomingDueBills.length === 0) {
            console.log("✅ No upcoming due bills found.");
            return;
        }

        for (const bill of upcomingDueBills) {
            const message = generateMessage(bill);

            // ✅ Check if notification already exists
            const existingNotification = await Notification.findOne({
                message,
                dueDate: bill.dueDate,
            });

            if (!existingNotification) {
                await Notification.create({
                    message,
                    dueDate: bill.dueDate,
                });
                console.log(`✅ Notification added: ${message}`);
            } else {
                console.log(`⚠️ Notification already exists for: ${bill.category}`);
            }
        }
    } catch (error) {
        console.error("❌ Error generating notifications:", error);
    }
});

module.exports = {}; // Required for importing this file in server.js
