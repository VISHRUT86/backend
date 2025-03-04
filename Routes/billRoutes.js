const express = require("express");
const Bill = require("../Models/Bill");
const ensureAuthenticated  = require("../Middlewares/Auth"); // ✅ Fixed Import
const Notification = require("../Models/Notification");

const router = express.Router();
// ✅ Mark bill as paid & remove its notification
router.put("/mark-paid/:id", async (req, res) => {
  try {
      const billId = req.params.id;
      
      // ✅ Bill ka status "Paid" karna
      const updatedBill = await Bill.findByIdAndUpdate(
          billId,
          { status: "Paid" },
          { new: true }
      );

      if (!updatedBill) {
          return res.status(404).json({ message: "Bill not found" });
      }

      // ✅ Notification delete karna (Jo same dueDate & message match kare)
      await Notification.deleteOne({ dueDate: updatedBill.dueDate });

      return res.json({ message: "Bill marked as paid & notification removed", updatedBill });

  } catch (error) {
      console.error("Error marking bill as paid:", error);
      return res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", ensureAuthenticated, async (req, res) => {
  try {
    const { title, amount, dueDate, category } = req.body;

    // Validate if all fields are provided
    if (!title || !amount || !dueDate || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the dueDate is a valid future date
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ error: "Invalid due date" });
    }
    
    if (parsedDueDate < new Date()) {
      return res.status(400).json({ error: "Only future dates are allowed" });
    }

    // Create the new bill object
    const newBill = new Bill({
      userId: req.user.id, // Ensure req.user.id exists
      title,
      amount,
      dueDate: parsedDueDate, // Ensure dueDate is properly parsed
      category,
      status: "Due",
    });

    // Save the new bill to the database
    const savedBill = await newBill.save();

    if (!savedBill) {
      return res.status(500).json({ error: "Failed to save bill" });
    }

    // Respond with a success message and the saved bill data
    res.status(201).json({ message: "Bill added successfully", bill: savedBill });
  } catch (error) {
    console.error("Error adding bill:", error); // Log the error for debugging
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Fetch all bills for the logged-in user
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user.id }).sort({ dueDate: 1 });

    if (!bills.length) {
      return res.status(404).json({ message: "No bills found" });
    }

    res.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-status/:id", ensureAuthenticated, async (req, res) => {
  try {
      const { status } = req.body;
      const bill = await Bill.findById(req.params.id);

      if (!bill) {
          return res.status(404).json({ message: "Bill not found" });
      }

      bill.status = status;
      await bill.save();

      // ✅ If bill is marked as "Paid", remove its notification
      if (status === "Paid") {
          await Notification.findOneAndDelete({ message: { $regex: bill.category, $options: "i" }, dueDate: bill.dueDate });
      }

      res.status(200).json({ message: "Bill status updated", bill });
  } catch (error) {
      console.error("Error updating bill status:", error);
      res.status(500).json({ message: "Error updating bill", error });
  }
});

// ✅ Delete bill & remove its notification
router.delete("/delete/:id", async (req, res) => {
  try {
      const billId = req.params.id;

      // ✅ Bill find karna
      const bill = await Bill.findById(billId);
      if (!bill) {
          return res.status(404).json({ message: "Bill not found" });
      }

      // ✅ Bill delete karna
      await Bill.findByIdAndDelete(billId);

      // ✅ Linked notification delete karna
      await Notification.deleteOne({ dueDate: bill.dueDate });

      return res.json({ message: "Bill deleted & notification removed" });

  } catch (error) {
      console.error("❌ Error deleting bill:", error);
      return res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
