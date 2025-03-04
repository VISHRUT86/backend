const express = require("express");
const Income = require("../Models/Income");
const ensureAuthenticated = require("../Middlewares/Auth");

const router = express.Router();

// ➕ **Add Income**
router.post("/add", ensureAuthenticated, async (req, res) => {
    try {
        const {  amount, date, source } = req.body;

        if ( !amount || !date || !source) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newIncome = new Income({
            user: req.user.id,
            amount,
            date,
            source
        });

        await newIncome.save();
        res.status(201).json({ message: "Income added successfully", income: newIncome });
    } catch (error) {
        console.error("Error adding income:", error);
        res.status(500).json({ error: "Error adding income" });
    }
});

// 📜 **Get Only Logged-in User's Incomes**
router.get("/all", ensureAuthenticated, async (req, res) => {
    try {
        const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 }); // ✅ Sorted by latest date
        res.json(incomes);
    } catch (error) {
        console.error("Error fetching incomes:", error);
        res.status(500).json({ error: "Error fetching incomes" });
    }
});

// ✏️ **Update Income**
router.put("/update/:id", ensureAuthenticated, async (req, res) => {
    try {
        const { category, amount, date, source } = req.body;

        const income = await Income.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            {  amount, date, source },
            { new: true } // ✅ Return updated income
        );

        if (!income) {
            return res.status(404).json({ error: "Income not found" });
        }

        res.json({ message: "Income updated successfully", income });
    } catch (error) {
        console.error("Error updating income:", error);
        res.status(500).json({ error: "Error updating income" });
    }
});


// ❌ Fix the Delete Income Route
router.delete("/delete/:id", ensureAuthenticated, async (req, res) => {
    try {
        const income = await Income.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id, // ✅ Ensure user can only delete their own incomes
        });

        if (!income) {
            return res.status(404).json({ error: "Income not found or unauthorized" });
        }

        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        console.log(error); // Debugging
        res.status(500).json({ error: "Error deleting income" });
    }
});



module.exports = router;
