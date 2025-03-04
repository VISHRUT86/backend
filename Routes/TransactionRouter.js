const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const fastCsv = require("fast-csv");
const Income = require("../Models/Income"); // ✅ Income Model
const Expense = require("../Models/Expense"); // ✅ Expense Model

router.get("/export", async (req, res) => {
    try {
        // ✅ Fetch all transactions (income + expenses)
        const incomes = await Income.find({});
        const expenses = await Expense.find({});
        
        // ✅ Merge and format data
        const transactions = [...incomes, ...expenses].map((item) => ({
            Type: item.__t === "Income" ? "Income" : "Expense", // ✅ Correct Type
            Amount: item.amount,
            Category: item.category,
            Date: new Date(item.date).toISOString().split('T')[0], // ✅ Only Date (YYYY-MM-DD)
        }));

        // ✅ File path
        const filePath = path.join(__dirname, "../exports/transactions.csv");
        const ws = fs.createWriteStream(filePath);

        // ✅ Write CSV
        fastCsv
            .write(transactions, { headers: true })
            .pipe(ws)
            .on("finish", () => {
                res.download(filePath, "transactions.csv", (err) => {
                    if (err) console.error("Download Error:", err);
                });
            });

    } catch (error) {
        console.error("CSV Export Error:", error);
        res.status(500).json({ message: "Error generating CSV" });
    }
});


module.exports = router;
