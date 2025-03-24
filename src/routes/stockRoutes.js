const express = require('express');
const controllers = require('../controllers/stock/stockControllers');
const stockDetail = require('../controllers/stock/stockdetail');
const {authenticateToken} = require("../middleware/authenticateToken");
const router = express.Router();
/**
 * @swagger
 * /stocks:
 *   get:
 *     summary: Get all stocks.
 *     description: Retrieves a list of all stocks, including related zone and user information.
 *     tags: [Stocks]
 *     responses:
 *       200:
 *         description: Successfully retrieved all stocks.
 *       500:
 *         description: Internal server error.
 */
router.get('/',authenticateToken, controllers.getAllStocks);
/**
 * @swagger
 * /stocks:
 *   post:
 *     summary: Create a new stock and add product quantities
 *     description: Creates a new stock entry in the stock table and associates product quantities in the stock-detail table.
 *     tags:
 *       - Stocks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - capacite
 *               - zone_id
 *               - responsable_id
 *               - products
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the stock.
 *                 example: "Warehouse A"
 *               type:
 *                 type: string
 *                 description: The type of the stock (e.g., cold storage, dry storage).
 *                 example: "Cold Storage"
 *               capacite:
 *                 type: integer
 *                 description: The capacity of the stock.
 *                 example: 5000
 *               zone_id:
 *                 type: string
 *                 description: The ID of the zone where the stock is located.
 *                 example: 1
 *               responsable_id:
 *                 type: string
 *                 description: The ID of the person responsible for the stock.
 *                 example: 2
 *               products:
 *                 type: array
 *                 description: A list of products with their quantities.
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_produit
 *                     - quantite
 *                   properties:
 *                     id_produit:
 *                       type: string
 *                       description: The ID of the product.
 *                       example: 101
 *                     quantite:
 *                       type: integer
 *                       description: The quantity of the product.
 *                       example: 50
 *     responses:
 *       201:
 *         description: Stock and product quantities added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stock and product quantities added successfully"
 *                 stock:
 *                   type: object
 *                   description: The created stock details.
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nom:
 *                       type: string
 *                       example: "Warehouse A"
 *                     type:
 *                       type: string
 *                       example: "Cold Storage"
 *                     capacite:
 *                       type: integer
 *                       example: 5000
 *                     zone_id:
 *                       type: integer
 *                       example: 1
 *                     responsable_id:
 *                       type: integer
 *                       example: 2
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-27T10:00:00.000Z"
 *                 details:
 *                   type: array
 *                   description: List of product quantities associated with the stock.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_stock:
 *                         type: integer
 *                         example: 1
 *                       id_produit:
 *                         type: integer
 *                         example: 101
 *                       quantite:
 *                         type: integer
 *                         example: 50
 *       400:
 *         description: Bad request. Missing or invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "All fields are required, and products must be an array."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/',authenticateToken, controllers.addStock);
/**
 * @swagger
 * /stock/{id}:
 *   put:
 *     summary: Update stock information
 *     description: Updates the information of a specific stock by its ID.
 *     tags:
 *       - Stocks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the stock entry.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the stock.
 *               type:
 *                 type: string
 *                 description: The new type of the stock.
 *               capacite:
 *                 type: integer
 *                 description: The new capacity of the stock.
 *               id_zone:
 *                 type: string
 *                 description: The new zone ID associated with the stock.
 *               status:
 *                 type: string
 *                 description: The new status of the stock.
 *               responsable_id:
 *                 type: string
 *                 description: The new ID of the stock's responsible person.
 *             example:
 *               name: "New Stock Name"
 *               type: "vehicule"
 *               capacite: 100
 *               id_zone: "string"
 *               status: "active"
 *               responsable_id: "string"
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Stock updated successfully
 *                 stock:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The unique ID of the stock.
 *                     nom:
 *                       type: string
 *                       description: The updated name of the stock.
 *                     type:
 *                       type: string
 *                       description: The updated type of the stock.
 *                     capacite:
 *                       type: integer
 *                       description: The updated capacity of the stock.
 *                     id_zone:
 *                       type: string
 *                       description: The updated zone ID associated with the stock.
 *                     status:
 *                       type: string
 *                       description: The updated status of the stock.
 *                     responsable:
 *                       type: string
 *                       description: The updated ID of the stock's responsible person.
 *       400:
 *         description: Bad Request (missing or invalid fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: id is required!
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.put('/:id',authenticateToken, controllers.updateStock);
/**
 * @swagger
 * /stocks/update-detail/{id}:
  *   put:
 *     summary: Met à jour un détail du stock
 *     description: Met à jour la quantité d'un produit dans le stock. Ajoute le produit si celui-ci n'existe pas encore.
 *     tags:
 *       - Stocks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID du stock
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_produit
 *               - quantite
 *             properties:
 *               id_produit:
 *                 type: string
 *                 description: L'ID du produit
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               quantite:
 *                 type: integer
 *                 description: La quantité du produit
 *                 example: 10
 *     responses:
 *       200:
 *         description: Détail du stock mis à jour avec succès
 *       201:
 *         description: Produit ajouté au stock avec succès
 *       400:
 *         description: Erreur de validation (données manquantes ou invalides)
 *       500:
 *         description: Erreur interne du serveur
 */
router.put('/update-detail/:id',authenticateToken, stockDetail.updateDetail)
/**
 * @swagger
 * /stocks/update-detail-status/{id}:
 *   put:
 *     summary: Update the status of a product in stock
 *     description: Updates the status of a product within a specific stock entry.
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the stock entry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - id_produit
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the product.
 *               id_produit:
 *                 type: string
 *                 description: The ID of the product.
 *     responses:
 *       200:
 *         description: Status of the product updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: The updated stock detail.
 *       400:
 *         description: Missing required fields or invalid input.
 *       404:
 *         description: Stock detail not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/update-detail-status/:id',authenticateToken, stockDetail.updateStatus);
/**
 * @swagger
 * /stocks/{id}:
 *   get:
 *     summary: Get a specific stock by ID.
 *     description: Retrieves the details of a stock by its ID, including related zone and user information.
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the stock to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the stock.
 *       400:
 *         description: Missing required fields or invalid input.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id',authenticateToken, controllers.getOneStock);
/**
 * @swagger
 * /stocks/{id}:
 *   delete:
 *     summary: Soft delete a stock entry
 *     description: Marks the stock as deleted by updating the `isDeleted` field to `true`.
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the stock entry to delete.
 *     responses:
 *       200:
 *         description: The stock was successfully marked as deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID or other bad request.
 *       404:
 *         description: Stock entry not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id',authenticateToken,controllers.deleteStock);
/**
 * @swagger
 * /stocks/assign-responsable:
 *   post:
 *     summary: Assign a responsible person to a stock.
 *     description: Updates the responsible person for a specific stock.
 *     tags: [Stocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - responsable
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the stock.
 *               responsable:
 *                 type: string
 *                 description: The responsible person to assign.
 *     responses:
 *       200:
 *         description: Successfully updated the stock's responsible person.
 *       400:
 *         description: Missing required fields or invalid input.
 *       500:
 *         description: Internal server error.
 */
router.post('/assign-responsable',authenticateToken, controllers.assignResponsable);

module.exports = router;