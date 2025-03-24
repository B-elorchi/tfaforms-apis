const express = require('express');
const { signUp, signIn, signOut } = require('../controllers/authControllers');
const { authenticateToken } = require('../middleware/authenticateToken');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     description: Signs up a new user by creating an account in Supabase and storing user data in the database.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: password123
 *               phone:
 *                 type: string
 *                 description: The phone number of the user.
 *                 example: 06........
 *               address:
 *                 type: string
 *                 description: The address of the user.
 *                 example: address
 *               role:
 *                 type: integer
 *                 description: The role ID of the user (e.g., 1 for admin, 2 for user).
 *                 example: 2
 *               name:
 *                 type: string
 *                 description: The name of the user.
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: User created successfully.
 *       400:
 *         description: Bad request, validation errors, or user creation errors.
 *       500:
 *         description: Internal server error.
 */
router.post('/register', signUp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Sign in an existing user.
 *     description: This endpoint allows users to log in using their email and password. Upon successful authentication, the user data and access token are returned.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         description: User successfully signed in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: The user's data, including their role.
 *                   example:
 *                     id: 123
 *                     email: user@example.com
 *                     roles: ["Admin","Direction General"]
 *                 token:
 *                   type: string
 *                   description: The user's access token for authentication.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SA1Yd8k..."
 *       400:
 *         description: Bad request, user authentication failed or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid credentials or missing email/password."
 *       404:
 *         description: User not found in database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "User not found in database."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Internal Server Error"
 */
router.post('/login', signIn);
router.post('/logout',authenticateToken, signOut);
module.exports = router;