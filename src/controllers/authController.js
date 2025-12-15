const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const TokenBlacklist = require("../models/TokenBlacklist");

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic field validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        //Password validation
        const passwordRegex = /^(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters long and contain at least one number"
            });
        }

        //Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        //Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        const tokens = generateToken(user._id);
        // Success response
        res.status(201).json({
            success: true,
            message: "Registered successful",
            data: {
                user: {
                    id: user._id,
                    username: user.name,
                    email: user.email
                },
                tokens
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error during registration",
            error: error.message
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const tokens = generateToken(user._id);

        res.json({
            success: true,
            message: "Login successful",
            data: {
                tokens
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
};

exports.currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Current user fetched successfully",
            data: {
                user: {
                    id: user._id,
                    username: user.name,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch current user",
            error: error.message
        });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "No token provided"
            });
        }

        const decoded = require("jsonwebtoken").decode(token);
        const expiresAt = new Date(decoded.exp * 1000); // Convert exp to milliseconds

        // Add token to blacklist
        await TokenBlacklist.create({ token, expiresAt });

        res.json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Logout failed",
            error: error.message
        });
    }
};