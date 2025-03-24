const express = require('express');
const Controllers = require('../controllers/villes/villeControllers');
const {authenticateToken} = require("../middleware/authenticateToken");
const router = express.Router();
/**
 * @swagger
 * /villes:
 *   get:
 *     summary: Get all cities (villes)
 *     tags: [Villes]
 *     description: Fetches a list of all cities in the database.
 *     responses:
 *       200:
 *         description: A list of all cities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The city ID.
 *                   nom:
 *                     type: string
 *                     description: The name of the city.
 *                   geoCode:
 *                     type: string
 *                     description: The geoCode of the city.
 *       500:
 *         description: Internal Server Error - Something went wrong.
 */
router.get('/',authenticateToken, Controllers.getVilles);
/**
 * @swagger
 * /villes:
 *   post:
 *     summary: Add a new city (ville)
 *     tags: [Villes]
 *     description: Adds a new city with a name and geoCode to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: The name of the city.
 *               geoCode:
 *                 type: string
 *                 description: The geographical code of the city.
 *     responses:
 *       201:
 *         description: City added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The city ID.
 *                 nom:
 *                   type: string
 *                   description: The name of the city.
 *                 geoCode:
 *                   type: string
 *                   description: The geoCode of the city.
 *       400:
 *         description: Bad Request - Missing required fields.
 *       500:
 *         description: Internal Server Error - Something went wrong.
 */
router.post('/',authenticateToken, Controllers.addVille);
/**
 * @swagger
 * /villes/{id}:
 *   put:
 *     summary: Update a city (ville)
 *     tags: [Villes]
 *     description: Updates an existing city by its ID with a new name and geoCode.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the city to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: The name of the city.
 *               geoCode:
 *                 type: string
 *                 description: The geographical code of the city.
 *     responses:
 *       200:
 *         description: City updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The updated city ID.
 *                 nom:
 *                   type: string
 *                   description: The updated name of the city.
 *                 geoCode:
 *                   type: string
 *                   description: The updated geoCode of the city.
 *       400:
 *         description: Bad Request - Missing required fields or invalid ID.
 *       500:
 *         description: Internal Server Error - Something went wrong.
 */
router.put('/:id',authenticateToken, Controllers.updateVille);
/**
 * @swagger
 * /villes/{id}:
 *   get:
 *     summary: Get a specific city (ville) by ID
 *     tags: [Villes]
 *     description: Fetches the details of a city based on its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the city to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A specific city.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The city ID.
 *                 nom:
 *                   type: string
 *                   description: The name of the city.
 *                 geoCode:
 *                   type: string
 *                   description: The geoCode of the city.
 *       400:
 *         description: Bad Request - Invalid ID.
 *       500:
 *         description: Internal Server Error - Something went wrong.
 */
router.get('/:id',authenticateToken, Controllers.getOneVille);

module.exports = router;
