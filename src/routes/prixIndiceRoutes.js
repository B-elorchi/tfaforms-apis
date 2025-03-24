const express = require("express");
const router = express.Router();
const prixIndiceController = require("../controllers/indicePrix/prixIndiceController");
const {authenticateToken} = require("../middleware/authenticateToken");
/**
 * @swagger
 * /prix-indice:
 *   get:
 *     summary: Retrieve all data from the PrixIndice table
 *     description: Fetches all records from the "PrixIndice" table.
 *     tags:
 *       - PrixIndice
 *     responses:
 *       200:
 *         description: Successfully retrieved all records from PrixIndice.
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
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   id_indice:
 *                     type: string
 *                     format: uuid
 *                     example: "321e4567-e89b-12d3-a456-426614174111"
 *                   id_produit:
 *                     type: string
 *                     format: uuid
 *                     example: "987e4567-e89b-12d3-a456-426614174222"
 *                   prix_unitaire:
 *                     type: number
 *                     example: 100.0
 *                   prix_collisage:
 *                     type: number
 *                     example: 50.0
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   Last_modified:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error.
 */
router.get("/",authenticateToken, prixIndiceController.getAllPrixIndice);

/**
 * @swagger
 * /prix-indice:
 *   post:
 *     summary: Add a new PrixIndice entry
 *     description: Adds a new entry to the "PrixIndice" table.
 *     tags:
 *       - PrixIndice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_indice:
 *                 type: string
 *                 format: uuid
 *                 example: "321e4567-e89b-12d3-a456-426614174111"
 *               id_produit:
 *                 type: string
 *                 format: uuid
 *                 example: "987e4567-e89b-12d3-a456-426614174222"
 *               prix_unitaire:
 *                 type: number
 *                 example: 100.0
 *     responses:
 *       201:
 *         description: Successfully added a new PrixIndice entry.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "PrixIndice added successfully"
 *                 data:
 *                   type: object
 *                   example:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     id_indice: "321e4567-e89b-12d3-a456-426614174111"
 *                     id_produit: "987e4567-e89b-12d3-a456-426614174222"
 *                     prix_unitaire: 100.0
 *
 *       400:
 *         description: Missing required fields or invalid input.
 *       500:
 *         description: Internal server error.
 */
router.post("/",authenticateToken, prixIndiceController.addPrixIndice);

/**
 * @swagger
 * /prix-indice:
 *   put:
 *     summary: Update an existing PrixIndice entry
 *     description: Updates an existing entry in the "PrixIndice" table. It fetches the product's colisage from the "produits" table and computes prix_collisage as prix_unitaire multiplied by colisage.
 *     tags:
 *       - PrixIndice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_indice:
 *                 type: string
 *                 format: uuid
 *                 example: "321e4567-e89b-12d3-a456-426614174111"
 *               id_produit:
 *                 type: string
 *                 format: uuid
 *                 example: "987e4567-e89b-12d3-a456-426614174222"
 *               prix_unitaire:
 *                 type: number
 *                 example: 100.0
 *     responses:
 *       200:
 *         description: Successfully updated the PrixIndice entry.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "PrixIndice updated successfully"
 *                 data:
 *                   type: object
 *                   example:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     id_indice: "321e4567-e89b-12d3-a456-426614174111"
 *                     id_produit: "987e4567-e89b-12d3-a456-426614174222"
 *                     prix_unitaire: 100.0
 *       400:
 *         description: Missing required fields or invalid input.
 *       500:
 *         description: Internal server error.
 */
router.put("/",authenticateToken, prixIndiceController.updatePrixIndice);

/**
 * @swagger
 * /prix-indice/calculate-montant-ventes:
 *   get:
 *     summary: Calculate total sales amount for each product
 *     description: Calculates the total sales amount (`montant_ventes`) for each product based on the `quantite` from `ventes_detail`, `id_indice` from `ventes`, and `prix_collisage` from `PrixIndice`.
 *     tags:
 *       - PrixIndice
 *     responses:
 *       200:
 *         description: Successfully calculated the total sales amount for each product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *                 example: 500.0
 *               example:
 *                 "987e4567-e89b-12d3-a456-426614174222": 500.0
 *                 "987e4567-e89b-12d3-a456-426614174333": 1000.0
 *       400:
 *         description: Error in fetching or processing data.
 *       500:
 *         description: Internal server error.
 */
router.get("/calculate-montant-ventes", prixIndiceController.calculateMontantVentes);

module.exports = router;