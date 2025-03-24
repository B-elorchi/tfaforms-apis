const express = require('express');
const controllers = require('../controllers/liste_intervalles/listeInterControllers');
const {authenticateToken} = require("../middleware/authenticateToken");

const router = express.Router();
/**
 * @swagger
 * /listes:
 *   post:
 *     summary: Create a new list with intervals
 *     description: Creates a new "liste_intervalles" and adds associated intervals.
 *     tags: 
 *       - Listes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the list.
 *               intervalle:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: An array of interval boundaries.
 *     responses:
 *       200:
 *         description: The list and intervals were created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liste:
 *                   type: object
 *                   description: The created list.
 *                 sous_liste:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: The created intervals.
 *       400:
 *         description: Bad request, invalid input or insertion error.
 *       500:
 *         description: Internal server error.
 */
router.post('/',authenticateToken, controllers.addListe);
/**
 * @swagger
 * /listes:
 *   get:
 *     summary: Get all lists with their intervals
 *     description: Fetches all "liste_intervalles" along with their associated intervals.
 *     tags: 
 *       - Listes
 *     responses:
 *       200:
 *         description: A list of all lists with their intervals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the list.
 *                   name:
 *                     type: string
 *                     description: The name of the list.
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: The creation timestamp.
 *                   intervalles:
 *                     type: array
 *                     items:
 *                       type: array
 *                       description: List of intervals.
 *       400:
 *         description: Bad request or error while fetching data.
 *       404:
 *         description: No lists found.
 *       500:
 *         description: Internal server error.
 */
router.get('/',authenticateToken, controllers.getListes);
/**
 * @swagger
 * /listes/{id}:
 *   get:
 *     summary: Get a single list with its intervals
 *     description: Fetches a specific "liste_intervalles" by ID along with its associated intervals.
 *     tags: 
 *       - Listes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the list to fetch.
 *     responses:
 *       200:
 *         description: The requested list with its intervals.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the list.
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: The creation timestamp.
 *                 intervalles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       intervalle:
 *                         type: array
 *                         description: The interval details.
 *       400:
 *         description: Bad request or invalid ID.
 *       404:
 *         description: List not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id',authenticateToken, controllers.getOneListe);
module.exports = router;