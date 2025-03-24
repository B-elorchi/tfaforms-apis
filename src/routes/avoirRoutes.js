const express = require('express');
const controllers = require('../controllers/Avoir/avoirControllers');
const router = express.Router();
/**
 * @swagger
 * /avoir:
 *   post:
 *     summary: Create an "avoir" for a vente (sale) and update stock.
 *     description: Updates the status of a vente to "avoir", retrieves vente details, and decrements stock quantity.
 *     tags:
 *       - Avoir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_vente
 *             properties:
 *               id_vente:
 *                 type: string
 *                 description: The ID of the vente (sale).
 *     responses:
 *       200:
 *         description: Stock successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_produit:
 *                     type: string
 *                     description: The product ID.
 *                   quantite:
 *                     type: integer
 *                     description: The updated quantity in stock.
 *       400:
 *         description: Bad request due to missing fields or invalid data.
 *       404:
 *         description: Vente, vente details, or stock not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/', controllers.createAvoir);
/**
 * @swagger
 * /avoir/details:
 *   post:
 *     summary: Create details for an "avoir" (credit note)
 *     description: This endpoint creates details for an "avoir" by checking the validity of the given products and calculating the total price.
 *     tags: 
 *       - Avoir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - id_avoir
 *               - products
 *             properties:
 *               id_avoir:
 *                 type: string
 *                 description: The ID of the "avoir".
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_produit
 *                     - quantite
 *                   properties:
 *                     id_produit:
 *                       type: string
 *                       description: The ID of the product.
 *                     quantite:
 *                       type: integer
 *                       description: The quantity of the product.
 *                       example: 10
 *     responses:
 *       201:
 *         description: Details created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Details calculated successfully!
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_produit:
 *                         type: integer
 *                         example: 456
 *                       quantite:
 *                         type: integer
 *                         example: 10
 *                       prix_collisage:
 *                         type: number
 *                         example: 25.5
 *                       total_price_per_product:
 *                         type: number
 *                         example: 255
 *                 final_price:
 *                   type: number
 *                   example: 510
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *       404:
 *         description: Resource not found (e.g., no "avoir" found, missing product price).
 *       500:
 *         description: Internal server error.
 */
router.post('/details', controllers.createDetail);
/**
 * @swagger
 * /avoir:
 *   get:
 *     summary: Retrieve a list of 'avoir' and their corresponding details
 *     description: Fetches all 'avoirs' and their associated 'avoir_details' from the database.
 *     tags: 
 *       - Avoir
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of 'avoirs' and their details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avoirs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       details:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id_avoir:
 *                               type: integer
 *                             product_name:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             price:
 *                               type: number
 *                               format: float
 *                       error:
 *                         type: string
 *                         description: Error message if there is an issue fetching details for this 'avoir'
 *       400:
 *         description: Bad request. Something went wrong while fetching data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 detail:
 *                   type: string
 *                   example: Detailed error message
 */
router.get('/', controllers.getALL);
/**
 * @swagger
 * /avoir/{id}:
 *   get:
 *     summary: Retrieve a specific 'avoir' by its ID and the corresponding details
 *     description: Fetches an 'avoir' by its ID and its associated 'avoir_details' from the database.
 *     tags:
 *       - Avoir
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the 'avoir' to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the 'avoir' and its details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_avoir:
 *                         type: string
 *                       product_name:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       price:
 *                         type: number
 *                         format: float
 *       400:
 *         description: Bad request. The provided ID may be invalid or there was an issue with the database query.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: No 'avoir' found with the specified ID, or no associated details exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 detail:
 *                   type: string
 *                   example: Detailed error message
 */
router.get('/:id', controllers.getById);
module.exports = router;