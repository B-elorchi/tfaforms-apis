const express = require('express');
const controllers = require('../controllers/indice/indiceControllers');
const router = express.Router();
const {authenticateToken} = require("../middleware/authenticateToken");

/**
 * @swagger
 * /indices:
 *   get:
 *     summary: Retrieve all indices with associated product prices
 *     description: Fetches all indices from the "indice" table, along with their related prices and products.
 *     tags:
 *       - Indices
 *     responses:
 *       200:
 *         description: Successfully retrieved all indices with product pricing details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   indice:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nom_indice:
 *                         type: string
 *                         example: "Indice Premium"
 *                       id_liste:
 *                         type: integer
 *                         example: 3
 *                   details:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         produit:
 *                           type: string
 *                           example: "Product A"
 *                         price:
 *                           type: number
 *                           example: 100
 *       400:
 *         description: Bad request or error while fetching data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error fetching indices"
 */
router.get('/',authenticateToken, controllers.getAllIndice);
/**
 * @swagger
 * /indices/{id}:
 *   get:
 *     summary: Get a single index and its associated prices
 *     description: This endpoint retrieves a specific index by its ID and fetches the related prices for the index, including product details such as product name and price.
 *     tags:
 *       - Indices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the index to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the index and its associated prices.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 indice:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the index.
 *                     nom:
 *                       type: string
 *                       description: The name of the index.
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: The creation timestamp of the index.
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       produit:
 *                         type: string
 *                         description: The name of the product associated with the price.
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: The price of the product.
 *       400:
 *         description: Bad Request, invalid ID or issues fetching data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing what went wrong.
 *       404:
 *         description: The index or related data was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message when index or related prices are not found.
 *       500:
 *         description: Internal server error occurred while fetching data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing the server issue.
 */
router.get('/:id',authenticateToken, controllers.getOne);
/**
 * @swagger
 * /indices:
 *   post:
 *     summary: Create a new indice (index)
 *     description: This endpoint allows you to create a new indice with the specified properties such as name, type, status, and associated list ID.
 *     tags:
 *       - Indices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom_indice:
 *                 type: string
 *                 description: The name of the indice (index).
 *               type_indice:
 *                 type: string
 *                 description: The type of the indice (e.g., "Type1", "Type2").
 *               status:
 *                 type: string
 *                 description: The status of the indice (e.g., "active", "inactive").
 *               id_liste:
 *                 type: string
 *                 description: The ID of the associated list for the indice.
 *             required:
 *               - nom_indice
 *               - type_indice
 *               - status
 *               - id_liste
 *     responses:
 *       201:
 *         description: Successfully created a new indice.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the newly created indice.
 *                 nom_indice:
 *                   type: string
 *                   description: The name of the indice.
 *                 type_indice:
 *                   type: string
 *                   description: The type of the indice.
 *                 status:
 *                   type: string
 *                   description: The status of the indice.
 *                 id_liste:
 *                   type: string
 *                   description: The ID of the associated list for the indice.
 *       400:
 *         description: Bad Request, invalid data or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing what went wrong.
 *       500:
 *         description: Internal server error occurred while creating the indice.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing the server issue.
 */
router.post('/',authenticateToken, controllers.createIndice);
/**
 * @swagger
 * /indices/addPrice:
 *   post:
 *     summary: Create a new price entry for a product and index
 *     description: This endpoint allows you to create a new price for a product and index by providing the necessary data, including the product and index IDs, and the unit price. The server will fetch the product's colisage value, calculate the total price based on the colisage, and store the new price.
 *     tags:
 *       - Indices
 *     requestBody:
 *       description: The details of the price to be created, including the product and index information.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_indice:
 *                 type: string
 *                 description: The ID of the index for which the price is being created.
 *               id_produit:
 *                 type: string
 *                 description: The ID of the product for which the price is being created.
 *               prix_unitaire:
 *                 type: number
 *                 format: float
 *                 description: The unit price of the product.
 *             required:
 *               - id_indice
 *               - id_produit
 *               - prix_unitaire
 *     responses:
 *       201:
 *         description: The price has been successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_indice:
 *                   type: string
 *                   description: The ID of the index.
 *                 id_produit:
 *                   type: string
 *                   description: The ID of the product.
 *                 prix_unitaire:
 *                   type: number
 *                   format: float
 *                   description: The unit price of the product.
 *                 prix_collisage:
 *                   type: number
 *                   format: float
 *                   description: The total price calculated based on the unit price and the product's colisage.
 *       400:
 *         description: Bad Request, missing required fields or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing what went wrong.
 *       500:
 *         description: Internal server error occurred during price creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing the server issue.
 */
router.post('/addPrice',authenticateToken, controllers.createPrix);
/**
 * @swagger
 * /indices/createIndiceWithPrix:
 *   post:
 *     summary: Create an Indice with associated Prices
 *     description: Creates a new `indice` entry and associates multiple products with pricing.
 *     tags:
 *       - Indices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom_indice
 *               - id_liste
 *               - Prix
 *             properties:
 *               nom_indice:
 *                 type: string
 *                 example: "Indice Premium"
 *               id_liste:
 *                 type: string
 *                 example: 1
 *               Prix:
 *                 type: object
 *                 additionalProperties:
 *                   type: number
 *                 example:
 *                   "101": 10  # id_produit: quantity
 *                   "102": 5
 *     responses:
 *       201:
 *         description: Indice and prices created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Indice and prices created successfully"
 *                 indice:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 1
 *                     nom_indice:
 *                       type: string
 *                       example: "Indice Premium"
 *                     id_liste:
 *                       type: integer
 *                       example: 1
 *                 prix:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_indice:
 *                         type: string
 *                         example: 1
 *                       id_produit:
 *                         type: string
 *                         example: 101
 *                       prix_unitaire:
 *                         type: number
 *                         example: 10
 *                       prix_collisage:
 *                         type: number
 *                         example: 100
 *       400:
 *         description: Bad request (validation errors)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: nom_indice, id_liste, Prix"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Products not found: 103"
 */
router.post('/createIndiceWithPrix',authenticateToken, controllers.createIndiceWithPrix);
/**
 * @swagger
 * /indices/{id}:
 *   put:
 *     summary: Update an existing indice (index) and its details
 *     description: Update an existing indice's main properties such as name, type, status, and associated list ID, along with its associated details (product and price).
 *     tags:
 *       - Indices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the indice to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom_indice:
 *                 type: string
 *                 description: The updated name of the indice (index).
 *               type_indice:
 *                 type: string
 *                 description: The updated type of the indice.
 *               status:
 *                 type: string
 *                 description: The updated status of the indice.
 *               id_liste:
 *                 type: string
 *                 description: The updated ID of the associated list for the indice.
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     produit:
 *                       type: string
 *                       example: "Updated Product Name"
 *                     price:
 *                       type: number
 *                       example: 150
 *     responses:
 *       200:
 *         description: Successfully updated the indice and its details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Indice and details updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nom_indice:
 *                       type: string
 *                     type_indice:
 *                       type: string
 *                     status:
 *                       type: string
 *                     id_liste:
 *                       type: string
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           produit:
 *                             type: string
 *                             example: "Updated Product Name"
 *                           price:
 *                             type: number
 *                             example: 150
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Indice not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id',authenticateToken, controllers.updateIndice);




module.exports = router;