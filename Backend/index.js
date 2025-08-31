import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";
import { Transaction, Connection, Keypair } from "@solana/web3.js";
import User from "./models/User.js";
import bs58 from 'bs58';




// Create a connection to the Solana network
const connection = new Connection("https://solana-devnet.g.alchemy.com/v2/6mFCPorjtiIGk-WlzevtyUEXl0xHqseb");


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
app.post("/api/v1/txn/sign", authenticateToken, async (req, res) => {

    // Here we will deserialize the transaction
    const serializedTx = req.body.message;

    console.log("Received serialized transaction");

    const tx = Transaction.from(Buffer.from(serializedTx, 'base64'));
    console.log("Transaction deserialized successfully");

    // Sign the transaction
    // First we will need the private key of the user which is store in the database
    const user = await User.findById(req.user._id);
    
    console.log("User data retrieved:", {
        id: user._id,
        email: user.email,
        hasPrivateKey: !!user.privateKey,
        privateKeyLength: user.privateKey ? user.privateKey.length : 0
    });
    
    if (!user.privateKey) {
        return res.status(400).json({
            success: false,
            message: "User private key not found",
            userId: req.user._id,
            userEmail: req.user.email
        });
    }

    try {
        // Convert the stored private key string back to a Keypair
        console.log("Raw private key from DB:", user.privateKey);
        
        // Import bs58 for decoding
        // const bs58 = await import('bs58');
        
        // Decode the bs58 private key back to Uint8Array
        const privateKeyBytes = bs58.decode(user.privateKey);
        console.log("Decoded private key bytes length:", privateKeyBytes.length);
        
        const userKeypair = Keypair.fromSecretKey(privateKeyBytes);
        console.log("User keypair created successfully");
        console.log("Keypair object:", userKeypair);
        console.log("Public key:", userKeypair.publicKey.toString());

        // Now we will sign the transaction
        const signedTx = tx.sign([userKeypair]);
        console.log("Transaction signed successfully");

        // Send the transaction to the network
        const signature = await connection.sendTransaction(signedTx);
        console.log("Transaction sent to network. Signature:", signature);

        res.json({
            message: "Successful txn sign",
            user: req.user,
            signature: signature
        });
    } catch (error) {
        console.error("Error during transaction signing:", error);
        res.status(500).json({
            success: false,
            message: "Error signing transaction",
            error: error.message
        });
    }
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
