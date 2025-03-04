const express = require("express");
const Expense = require("../Models/Expense");
const Income = require("../Models/Income");
const ensureAuthenticated = require("../Middlewares/Auth");
const router = express.Router();


// Get expense summary
router.get("/expense-summary", async (req, res) => {
  try {
      const expenses = await Expense.find({});

      // Group expenses by category
      const categorySummary = expenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
      }, {});

      // Format data for frontend
      const categoryData = Object.keys(categorySummary).map((category) => ({
          category,
          amount: categorySummary[category],
      }));

      // Monthly trend data
      const monthlyData = {};
      expenses.forEach((expense) => {
          const month = new Date(expense.date).toLocaleString("en-US", { month: "short", year: "numeric" });
          monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
      });

      const monthlyTrend = Object.keys(monthlyData).map((month) => ({
          month,
          amount: monthlyData[month],
      }));

      res.json({ categoryData, monthlyTrend });
  } catch (error) {
      res.status(500).json({ message: "Error fetching expense summary", error });
  }
});



// 📊 Get Dashboard Summary
router.get("/summary", ensureAuthenticated, async (req, res) => {
  try {
    const totalIncome = await Income.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpenses = await Expense.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const incomeTotal = totalIncome.length ? totalIncome[0].total : 0;
    const expenseTotal = totalExpenses.length ? totalExpenses[0].total : 0;
    const balance = incomeTotal - expenseTotal;

    res.json({ totalIncome: incomeTotal, totalExpenses: expenseTotal, balance });
  } catch (error) {
    res.status(500).json({ error: "Error fetching dashboard data" });
  }
});

module.exports = router;
