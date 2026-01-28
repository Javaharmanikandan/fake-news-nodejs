// ====================================================
// AUTHENTICATION CONTROLLER
// ====================================================
// Handles user registration and login
// Simple password-based authentication (no JWT)
// ====================================================

const bcrypt = require('bcrypt');
const { query } = require('../db/connection');

// Register a new user
const register = async (req, res) => {
    try {
        const { email, phone, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ 
                error: 'Email, password, and name are required' 
            });
        }

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                error: 'User with this email already exists' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await query(
            `INSERT INTO users (email, phone, password, name) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, email, name, role, created_at`,
            [email, phone || null, hashedPassword, name]
        );

        const user = result.rows[0];

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // Validate input
        if (!password || (!email && !phone)) {
            return res.status(400).json({ 
                error: 'Email or phone and password are required' 
            });
        }

        // Find user by email or phone
        let user;
        if (email) {
            const result = await query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            user = result.rows[0];
        } else if (phone) {
            const result = await query(
                'SELECT * FROM users WHERE phone = $1',
                [phone]
            );
            user = result.rows[0];
        }

        // Check if user exists
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return user data (without password)
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    register,
    login
};

