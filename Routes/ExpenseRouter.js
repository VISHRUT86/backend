const express = require("express");
const Expense = require("../Models/Expense");
const ensureAuthenticated = require("../Middlewares/Auth"); 
const router = express.Router();

// ➕ Add Expense
router.post("/add", ensureAuthenticated, async (req, res) => {
  try {
    const { category, amount, date, description } = req.body;
    const newExpense = new Expense({
      user: req.user.id,
      category,
      amount,
      date,
      description
    });
    await newExpense.save();
    res.status(201).json({ message: "Expense added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding expense" });
    console.log(error);
  }
});

// 📜 Get All Expenses (For Logged-in User)
router.get("/all", ensureAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Error fetching expenses" });
  }
});

// ✏️ Update Expense
router.put("/update/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { category, amount, date, description } = req.body;
    await Expense.findByIdAndUpdate(req.params.id, {
      category,
      amount,
      date,
      description
    });
    res.json({ message: "Expense updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating expense" });
  }
});


// ❌ Delete Expense (Fixed)
router.delete("/delete/:id", ensureAuthenticated, async (req, res) => {
    try {
      const expense = await Expense.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id, // ✅ Ensure user can only delete their own expenses
      });
  
      if (!expense) {
        return res.status(404).json({ error: "Expense not found or unauthorized" });
      }
  
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.log(error); // Debugging
      res.status(500).json({ error: "Error deleting expense" });
    }
  });
  

module.exports = router;
