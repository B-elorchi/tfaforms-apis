const express = require("express");
const controllers = require("../controllers/retour/retourControllers");
const {authenticateToken} = require("../middleware/authenticateToken");
const router = express.Router();

/**
 * @swagger
 * /retours:
 *   post:
 *     summary: Add a return (retour) for a sale
 *     description: Registers a return for a sale, updates stock levels, and marks the sale as "retour".
 *     tags:
 *       - Retours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_vente
 *               - cause
 *               - produits
 *             properties:
 *               id_vente:
 *                 type: string
 *                 description: ID of the sale being returned.
 *                 example: 123
 *               cause:
 *                 type: string
 *                 description: Reason for the return.
 *                 example: "Product defect"
 *               produits:
 *                 type: array
 *                 description: List of returned products.
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_produit
 *                     - quantite
 *                   properties:
 *                     id_produit:
 *                       type: string
 *                       description: Product ID.
 *                       example: 456
 *                     quantite:
 *                       type: integer
 *                       description: Quantity of the product being returned.
 *                       example: 2
 *     responses:
 *       200:
 *         description: Return added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Retour added successfully"
 *                 retour:
 *                   type: object
 *                   description: Details of the return.
 *       400:
 *         description: Invalid request, missing required fields, or stock errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "id_vente and cause are required!"
 */
router.post("/",authenticateToken, controllers.addRetour);

/**
 * @swagger
 * /retours:
 *   get:
 *     summary: Get all retours
 *     description: Fetch a list of all retours.
 *     tags:
 *       - Retours
 *     responses:
 *       200:
 *         description: List of retours.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440000"
 *                   id_vente:
 *                     type: string
 *                     format: uuid
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   id_stock_retour:
 *                     type: string
 *                     format: uuid
 *                     example: "987e6543-e21b-34d5-c678-556677889900"
 *                   cause:
 *                     type: string
 *                     example: "Wrong product delivered"
 *       500:
 *         description: Server error.
 */
router.get("/",authenticateToken, controllers.getRetours);

/**
 * @swagger
 * /retours/{id}:
 *   get:
 *     summary: Get a specific retour
 *     description: Fetch a retour by its ID.
 *     tags:
 *       - Retours
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the retour.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: A single retour.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 id_vente:
 *                   type: string
 *                   format: uuid
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 id_stock_retour:
 *                   type: string
 *                   format: uuid
 *                   example: "987e6543-e21b-34d5-c678-556677889900"
 *                 cause:
 *                   type: string
 *                   example: "Product expired"
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Retour not found.
 *       500:
 *         description: Server error.
 */
router.get("/:id",authenticateToken, controllers.getRetour);
/**
 * @swagger
 * /retours/detail/{id}:
 *   put:
 *     summary: Update a specific retour_detail by its ID
 *     description: Updates an existing retour_detail entry based on the provided ID and request body.
 *     tags:
 *       - Retours
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the retour_detail to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_produit:
 *                 type: string
 *                 description: The ID of the product associated with this retour_detail.
 *                 example: 123
 *               quantite:
 *                 type: integer
 *                 description: The updated quantity of the product.
 *                 example: 10
 *     responses:
 *       200:
 *         description: Successfully updated the retour_detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 id_produit:
 *                   type: string
 *                 quantite:
 *                   type: integer
 *       400:
 *         description: Bad request. Missing required fields or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "id is required!"
 *       404:
 *         description: Detail not found with the specified ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Detail not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.put("/detail/:id",authenticateToken, controllers.updateDetail);
/**
 * @swagger
 * /retours/{id}:
 *   put:
 *     summary: Update the cause of a specific retour by ID
 *     description: Updates the "cause" field of a retour in the database based on its ID.
 *     tags:
 *       - Retours
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the retour to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cause:
 *                 type: string
 *                 description: The reason for the retour.
 *                 example: "Product damaged during shipping"
 *     responses:
 *       200:
 *         description: Successfully updated the retour cause.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 cause:
 *                   type: string
 *       400:
 *         description: Bad request. The provided ID is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Retour not found with the specified ID.
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
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.put("/:id",authenticateToken, controllers.updateCause);
/**
 * @swagger
 * /retours/valider:
 *   post:
 *     summary: Validate a retour and update stock levels
 *     description: Retrieves a retour by ID, updates stock levels for the seller and warehouse, and marks the retour as validated.
 *     tags:
 *       - Retours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the retour to validate.
 *     responses:
 *       200:
 *         description: Retour successfully validated.
 *       400:
 *         description: Bad request. Possible reasons - missing ID or database error.
 *       404:
 *         description: Retour or stock not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/valider",authenticateToken, controllers.valider);
module.exports = router;
