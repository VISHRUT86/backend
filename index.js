const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");

// ✅ Import Routes
const AuthRouter = require('./Routes/AuthRouter');
const ExpenseRouter = require('./Routes/ExpenseRouter');
const CategoryRouter = require("./Routes/CategoryRouter");
const IncomeRouter = require("./Routes/IncomeRouter");
const DashboardRouter = require("./Routes/DashboardRouter");
const transactionRoutes = require("./Routes/TransactionRouter");
const billRoutes = require("./Routes/billRoutes");
const goalRoutes = require("./Routes/goalRouter"); // ✅ Goals Route (Authentication Removed)
const ensureAuthenticated = require('./Middlewares/Auth');
const notificationRoutes = require("./Routes/notificationRoutes"); // ✅ Import notification routes


require("./cronJobs/dueBillNotifier"); // ✅ Load Due Bill Notification Cron Job
require('dotenv').config();
require('./Models/db');
app.use(express.json()); // ✅ Allows parsing JSON request body
const PORT = process.env.PORT || 8080;

// ✅ Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const cors = require('cors');  // Import CORS
// app.use(cors());  // Enable CORS for all origins

// ✅ Proper CORS Configuration
app.use(cors({
    origin: 'https://f1-6ljh.onrender.com',  // Allow requests only from your frontend
    methods: 'GET,POST,PUT,DELETE',  // Allow specific HTTP methods
    allowedHeaders: 'Content-Type,Authorization'  // Allow specific headers
  }));
  
// ✅ Manually handle Preflight requests (OPTIONS)
app.options('*', cors());

app.use(bodyParser.json());

app.get('/ping', (req, res) => {
    res.send('PONG');
});

app.get('/dashboard', (req, res) => {
    res.send("Dashboard Route Working!");
});




// ✅ Routes (Authorization Applied Where Needed)
app.use('/', AuthRouter);
app.use('/expenses', ensureAuthenticated, ExpenseRouter);
app.use('/categories', CategoryRouter);
app.use('/incomes', ensureAuthenticated, IncomeRouter);
app.use("/dashboard", DashboardRouter);
app.use("/transactions", transactionRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/notifications", notificationRoutes); // ✅ Add notification routes

// ✅ 🚀 Goals Route (Authentication Removed)
app.use("/goals", goalRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server is running on ${PORT}`);
});
