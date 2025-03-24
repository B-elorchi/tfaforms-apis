const express = require("express");
const controllers = require("../controllers/inventaire/inventaireController");
const router = express.Router();
const {authenticateToken} = require("../middleware/authenticateToken");

/**
 * @swagger
 * components:
 *   schemas:
 *     AssignResponsableRequest:
 *       type: object
 *       required:
 *         - id_responsable
 *         - stocks
 *         - id_indice
 *         - start_date
 *         - end_date
 *       properties:
 *         id_responsable:
 *           type: string
 *           format: uuid
 *           description: The UUID of the responsible person to assign.
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         stocks:
 *           oneOf:
 *             - type: string
 *               format: uuid
 *               description: A single stock ID.
 *               example: "550e8400-e29b-41d4-a716-446655440001"
 *             - type: array
 *               items:
 *                 type: string
 *                 format: uuid
 *                 description: An array of stock IDs.
 *                 example: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]
 *         id_indice:
 *           type: string
 *           format: uuid
 *           description: The UUID of the indice.
 *           example: "550e8400-e29b-41d4-a716-446655440003"
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: The start date of the inventory.
 *           example: "2023-10-01T12:34:56Z"
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: The end date of the inventory.
 *           example: "2023-10-02T12:34:56Z"
 *
 * /inventaire/create:
 *   post:
 *     summary: Create a new inventory with one or many stock IDs
 *     description: This endpoint creates a new inventory entry for one or many stock IDs.
 *     tags:
 *       - Inventaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignResponsableRequest'
 *     responses:
 *       201:
 *         description: Successfully created inventory entries.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message.
 *                   example: "Inventories created successfully"
 *                 inventories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         format: int64
 *                         example: 123
 *                       id_responsable:
 *                         type: string
 *                         format: uuid
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       id_stock:
 *                         type: string
 *                         format: uuid
 *                         example: "550e8400-e29b-41d4-a716-446655440001"
 *                       id_indice:
 *                         type: string
 *                         format: uuid
 *                         example: "550e8400-e29b-41d4-a716-446655440003"
 *                       start_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-10-01T12:34:56Z"
 *                       end_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-10-02T12:34:56Z"
 *       400:
 *         description: Bad Request, invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing what went wrong.
 *                   example: "stocks must be a single ID or an array of IDs"
 *       500:
 *         description: Internal server error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing the server issue.
 *                   example: "Internal server error"
 */
router.post("/create",authenticateToken, controllers.assignResponsable);

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateInventaireDetailsRequest:
 *       type: object
 *       required:
 *         - id_produit
 *         - quantite_produit
 *         - quantite_inventaire
 *         - id_indice
 *         - id_stock
 *         - id_responsable
 *         - start_date
 *         - end_date
 *       properties:
 *         id_produit:
 *           type: string
 *           format: uuid
 *           description: The UUID of the product.
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         quantite_produit:
 *           type: integer
 *           description: The quantity of the product.
 *           example: 100
 *         quantite_inventaire:
 *           type: integer
 *           description: The quantity of the product in the inventory.
 *           example: 90
 *         id_indice:
 *           type: string
 *           format: uuid
 *           description: The UUID of the indice.
 *           example: "550e8400-e29b-41d4-a716-446655440003"
 *         id_stock:
 *           type: string
 *           format: uuid
 *           description: The UUID of the stock.
 *           example: "550e8400-e29b-41d4-a716-446655440004"
 *         id_responsable:
 *           type: string
 *           format: uuid
 *           description: The UUID of the responsible person.
 *           example: "550e8400-e29b-41d4-a716-446655440005"
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: The start date of the inventory record.
 *           example: "2024-03-01T10:00:00Z"
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: The end date of the inventory record.
 *           example: "2024-03-10T18:00:00Z"
 *
 * /inventaire/details:
 *   post:
 *     summary: Create inventaire details with calculations
 *     description: This endpoint creates inventaire details with calculated fields like quantite_manquant and prix_paye. The id_inventaire is generated automatically.
 *     tags:
 *       - Inventaire Details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInventaireDetailsRequest'
 *     responses:
 *       200:
 *         description: Successfully created inventaire details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message.
 *                   example: "Inventaire details created successfully"
 *                 inventaire_details:
 *                   type: object
 *                   properties:
 *                     id_inventaire:
 *                       type: integer
 *                       description: The auto-generated ID of the inventory.
 *                       example: 123
 *                     prix_paye:
 *                       type: number
 *                       format: double
 *                       description: The calculated total price paid.
 *                       example: 14400
 *       400:
 *         description: Bad Request, invalid input or issues creating the details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing what went wrong.
 *                   example: "Invalid input data"
 *       404:
 *         description: PrixIndice not found for the given product and indice.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message when PrixIndice is not found.
 *                   example: "PrixIndice not found for the given product and indice"
 *       500:
 *         description: Internal server error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message detailing the server issue.
 *                   example: "Internal server error"
 */
router.post("/details",authenticateToken, controllers.createInventaireDetails);


/**
 * @swagger
 * /inventaire/details:
 *   get:
 *     summary: Get all inventaire details
 *     description: This endpoint retrieves all inventaire details from the database.
 *     tags:
 *       - Inventaire Details
 *     responses:
 *       200:
 *         description: Successfully retrieved all inventaire details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inventaire_details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the inventaire detail.
 *                       id_inventaire:
 *                         type: integer
 *                         description: The ID of the inventory.
 *                       id_stock:
 *                         type: string
 *                         format: uuid
 *                         description: The UUID of the stock.
 *                       id_produit:
 *                         type: string
 *                         format: uuid
 *                         description: The UUID of the product.
 *                       quantite_produit:
 *                         type: integer
 *                         description: The quantity of the product.
 *                       quantite_inventaire:
 *                         type: integer
 *                         description: The quantity of the product in the inventory.
 *                       quantite_manquant:
 *                         type: integer
 *                         description: The missing quantity of the product.
 *                       prix_paye:
 *                         type: number
 *                         format: double
 *                         description: The total price paid for the product.
 *                       id_indice:
 *                         type: string
 *                         format: uuid
 *                         description: The UUID of the indice.
 *       404:
 *         description: No inventaire details found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message when no inventaire details are found.
 *                   example: "No inventaire details found"
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
 *                   example: "Internal server error"
 */
router.get("/details",authenticateToken, controllers.getAllInventaireDetails);
/**
 * @swagger
 * /inventaire/all:
 *   get:
 *     summary: Get all inventaire
 *     description: This endpoint retrieves all inventaire details from the database.
 *     tags:
 *       - Inventaire
 *     responses:
 *       200:
 *         description: Successfully retrieved all inventaire.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inventaire:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the inventaire detail.
 *                       id_responsable:
 *                         type: integer
 *                         description: The ID of the inventory.
 *                       id_stock:
 *                         type: string
 *                         format: uuid
 *                         description: The UUID of the stock.
 *                       id_indice:
 *                         type: string
 *                         format: uuid
 *                         description: The UUID of the product.
 *                       start_date:
 *                         type: integer
 *                         description: The quantity of the product.
 *                       end_date:
 *                         type: integer
 *                         description: The quantity of the product in the inventory.
 *                     
 *       404:
 *         description: No inventaire details found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message when no inventaire are found.
 *                   example: "No inventaire details found"
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
 *                   example: "Internal server error"
 */
router.get("/all",authenticateToken, controllers.getAllInventaire);

module.exports = router;
