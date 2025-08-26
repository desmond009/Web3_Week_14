import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);

// Protected transaction routes
app.post("/api/v1/txn/sign", authenticateToken, (req, res) => {
    res.json({
        message: "Successful txn sign",
        user: req.user
    });
});

app.get("/api/v1/txn", authenticateToken, (req, res) => {
    res.json({
        message: "Successful txn",
        user: req.user
    });
});

// Health check route
app.get("/api/v1/health", (req, res) => {
    res.json({
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
