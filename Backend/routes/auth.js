import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { Keypair } from '@solana/web3.js';
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, walletAddress } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            walletAddress: walletAddress || null
        });

        // Generate private and public keys
        const keypair = new Keypair();

        const privateKey = JSON.stringify(Array.from(keypair.secretKey));
        const publicKey = keypair.publicKey.toString();

        console.log("Generated keys for user:", {
            email,
            privateKeyLength: privateKey.length,
            publicKey: publicKey
        });

        // Save the keys to the user document
        user.privateKey = privateKey;
        user.publicKey = publicKey;

        await user.save();
        
        console.log("User saved with keys:", {
            userId: user._id,
            hasPrivateKey: !!user.privateKey,
            hasPublicKey: !!user.publicKey
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'fallback_jwt_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username, 
                email: user.email,
                walletAddress: user.walletAddress,
                publicKey: publicKey
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Signin route
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'fallback_jwt_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                walletAddress: user.walletAddress
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export default router; 