const express = require("express");
const mongoose = require("mongoose"); // ✅ FIX: Import mongoose

const Category = require("../Models/Category");
const router = express.Router();

// ➕ Add New Category
router.post("/add", async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding category" });
    console.log(error)
  }
});

// 📜 Get All Categories
router.get("/all", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching categories" });
  }
});

// 🗑️ Delete Category with Validation
router.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // ✅ Check if ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Category ID" });
      }
  
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
  
      await Category.findByIdAndDelete(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete Error:", error);
      res.status(500).json({ error: "Error deleting category" });
    }
  });

module.exports = router;
