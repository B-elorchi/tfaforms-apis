const express = require("express");
const controllers = require("../controllers/RPP/RPPConrollers");
const {authenticateToken} = require("../middleware/authenticateToken");
const router = express.Router();
/**
 * @swagger
 * /rpp:
 *   post:
 *     summary: Create a new RPP
 *     description: Adds a new RPP name to the database.
 *     tags: [RPP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the RPP
 *     responses:
 *       201:
 *         description: RPP successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 RPP:
 *                   type: object
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/",authenticateToken, controllers.createRPP);
/**
 * @swagger
 * /rpp/detail:
 *   post:
 *     summary: Create a new RPP Detail
 *     description: Adds a new RPP detail to the database.
 *     tags: [RPP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_intervalle
 *               - id_indice
 *               - id_name
 *             properties:
 *               id_intervalle:
 *                 type: string
 *                 description: The ID of the interval
 *               id_indice:
 *                 type: string
 *                 description: The ID of the indice
 *               id_name:
 *                 type: string
 *                 description: The ID of the RPP name
 *     responses:
 *       201:
 *         description: RPP detail successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 detail:
 *                   type: object
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/detail",authenticateToken, controllers.createRPPDetail);
/**
 * @swagger
 * /rpp:
 *   get:
 *     summary: Get all RPP names with their details
 *     description: Fetches all RPP names and their corresponding details, including indices and intervals.
 *     tags: [RPP]
 *     responses:
 *       200:
 *         description: Successfully retrieved all RPPs with their details.
 *       400:
 *         description: Error fetching RPP data.
 *       500:
 *         description: Internal server error.
 */
router.get("/",authenticateToken, controllers.getAll);
/**
 * @swagger
 * /rpp/{id}:
 *   get:
 *     summary: Get a specific RPP by ID
 *     description: Fetches a specific RPP name and its corresponding details, including indices and intervals.
 *     tags: [RPP]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the RPP to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the RPP with details.
 *       400:
 *         description: Invalid request or missing ID.
 *       500:
 *         description: Internal server error.
 */
router.get("/:id",authenticateToken, controllers.getOne);
/**
 * @swagger
 * /rpp/affect-rpp-to-zone:
 *   post:
 *     summary: Affects an RPP to multiple zones
 *     description: This endpoint allows you to assign an RPP (Réseau de Production de Périmètre) to multiple zones.
 *     tags: [RPP]
 *     operationId: affectRPPToZone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_RPP:
 *                 type: string
 *                 description: The ID of the RPP to be assigned to zones.
 *               zone_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of zone IDs to which the RPP will be assigned.
 *     responses:
 *       200:
 *         description: Successfully affected RPP to zones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A success message confirming the operation.
 *                   example: "RPP affectation completed!"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The zone ID.
 *                         example: 2
 *                       message:
 *                         type: string
 *                         description: Message regarding the affectation status of the zone.
 *                         example: "RPP affected successfully!"
 *                       error:
 *                         type: string
 *                         description: Error message if something went wrong.
 *                         example: "zone not found!"
 *                       data:
 *                         type: object
 *                         description: The updated zone data.
 *                         example: { "id": 2, "name": "Zone 1", "Last_modified": "2025-02-16T00:00:00Z" }
 *       400:
 *         description: Bad request, missing parameters or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message explaining the bad request.
 *                   example: "id_RPP and zone_ids are required!"
 *       404:
 *         description: Zone not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message explaining that the zone was not found.
 *                   example: "zone not found!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates that the server failed to process the request.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: The general error message.
 *                   example: "Internal server error"
 *                 detail:
 *                   type: string
 *                   description: The specific error detail.
 *                   example: "Detailed error message."
 */
router.post("/affect-rpp-to-zone",authenticateToken, controllers.affectRPPToZone);
/**
 * @swagger
 * /rpp/affect-rpp-to-vendeur:
 *   post:
 *     summary: Assign an RPP to a vendeur
 *     description: Updates the vendeur's record to assign an RPP (Regional Point Person).
 *     tags:
 *       - RPP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_vendeur
 *               - id_RPP
 *             properties:
 *               id_vendeur:
 *                 type: string
 *                 description: The ID of the vendeur.
 *               id_RPP:
 *                 type: string
 *                 description: The ID of the RPP to assign.
 *     responses:
 *       200:
 *         description: Successfully assigned RPP to vendeur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "RPP affectation completed!"
 *                 results:
 *                   type: object
 *                   description: The updated vendeur data.
 *       400:
 *         description: Missing required fields or invalid request.
 *       404:
 *         description: Vendeur not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/affect-rpp-to-vendeur",authenticateToken, controllers.affectRPPToVendeur);

/**
 * @swagger
 * /rpp/{id}:
 *   put:
 *     summary: Update an RPP
 *     description: Update the RPP's name and its associated details.
 *     tags:
 *       - RPP
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the RPP to update.
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
 *                 description: The updated name of the RPP.
 *               is_deleted:
 *                 type: boolean
 *                 description: The deletion flag.
 *               details:
 *                 type: array
 *                 description: Array of detail objects for the RPP.
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_intervalle:
 *                       type: string
 *                       description: The ID of the interval.
 *                     id_indice:
 *                       type: string
 *                       description: The ID of the indice.
 *     responses:
 *       200:
 *         description: RPP updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rpp:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     Last_modified:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */

router.put("/:id",authenticateToken, controllers.updateRPP);
module.exports = router;
