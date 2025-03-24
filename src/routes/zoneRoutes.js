const express = require("express");
const controllers = require("../controllers/zones/zoneControllers");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: API pour gérer les zones.
 */

/**
 * @swagger
 * /zones:
 *   post:
 *     summary: Ajouter une nouvelle zone.
 *     tags: [Zones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Nom
 *             properties:
 *               Nom:
 *                 type: string
 *                 description: Le nom de la zone.
 *               geoCode:
 *                 type: string
 *                 description: Le code géographique de la zone.
 *               id_ville:
 *                 type: string
 *                 description: L'ID de la ville à laquelle la zone appartient.
 *     responses:
 *       201:
 *         description: Zone ajoutée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 zone:
 *                   type: object
 *       400:
 *         description: Requête invalide (Nom manquant).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erreur serveur.
 */
router.post("/", authenticateToken, controllers.addZone);
/**
 * @swagger
 * /zones/{id}:
 *   put:
 *     summary: Mettre à jour une zone existante.
 *     tags: [Zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de la zone.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nom:
 *                 type: string
 *                 description: Le nouveau nom de la zone.
 *               geoCode:
 *                 type: string
 *                 description: Le nouveau code géographique.
 *               id_ville:
 *                 type: string
 *                 description: Le nouvel ID de la ville à laquelle la zone appartient.
 *     responses:
 *       200:
 *         description: Zone mise à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 zone:
 *                   type: object
 *       400:
 *         description: Requête invalide (ID ou autres paramètres manquants).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erreur serveur.
 */
router.put("/:id", authenticateToken, controllers.updateZone);

/**
 * @swagger
 * /zones:
 *   get:
 *     summary: Récupérer toutes les zones.
 *     tags: [Zones]
 *     responses:
 *       200:
 *         description: Liste des zones récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Erreur serveur.
 */
router.get("/", authenticateToken, controllers.getAll);
/**
 * @swagger
 * /zones/{id}:
 *   get:
 *     summary: Récupérer une zone spécifique.
 *     tags: [Zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de la zone.
 *     responses:
 *       200:
 *         description: Zone récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Requête invalide (ID manquant).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erreur serveur.
 */
router.get("/:id", authenticateToken, controllers.getOne);
/**
 * @swagger
 * /zones/assign-to-zone:
 *   post:
 *     summary: Assign a vendeur to a zone
 *     tags:
 *       - Zones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_vendeur
 *               - id_zone
 *             properties:
 *               id_vendeur:
 *                 type: string
 *                 description: The ID of the vendeur
 *                 example: 123-34343-3434
 *               id_zone:
 *                 type: string
 *                 description: The ID of the zone
 *                 example: 28348-23423-23423
 *     responses:
 *       200:
 *         description: Vendeur successfully assigned to the zone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vendeur affecté avec succès
 *                 zone:
 *                   type: object
 *                   properties:
 *                     id_vendeur:
 *                       type: integer
 *                       example: 1
 *                     id_zone:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Missing or invalid input, or database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: id_vendeur and id_zone are required!
 *       500:
 *         description: Internal server error
 */
router.post("/assign-to-zone", authenticateToken, controllers.AssignToZone);
/**
 * @swagger
 * /zones/unassign-from-zone:
 *   post:
 *     summary: Unassign a vendeur from a zone
 *     tags:
 *       - Zones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_vendeur
 *               - id_zone
 *             properties:
 *               id_vendeur:
 *                 type: string
 *                 description: The ID of the vendeur
 *                 example: 113-34343-3434
 *               id_zone:
 *                 type: string
 *                 description: The ID of the zone
 *                 example: 23348-23423-23423
 *     responses:
 *       200:
 *         description: Vendeur successfully unassigned from the zone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vendeur désaffecté avec succès
 *                 zone:
 *                   type: object
 *                   properties:
 *                     id_vendeur:
 *                       type: string
 *                       example: 1
 *                     id_zone:
 *                       type: string
 *                       example: 2
 *       400:
 *         description: Missing or invalid input, or database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Vendeur is not assigned to this zone!
 *       500:
 *         description: Internal server error
 */
router.post(
  "/unassign-from-zone",
  authenticateToken,
  controllers.unassignFromZone
);
/**
 * @swagger
 * /zones/vendeur/{id}:
 *   get:
 *     summary: Get the list of vendors (vendeur) in a specific zone.
 *     description: Fetches a list of vendors associated with a given `id_zone`. It also includes the name of users linked to each vendor.
 *     tags:
 *       - Zones
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the zone to retrieve vendors for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved vendor data for the zone.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_zone:
 *                     type: string
 *                     description: The zone ID.
 *                   vendeur_id:
 *                     type: string
 *                     description: Vendor ID.
 *                   name:
 *                     type: string
 *                     description: Vendor's name.
 *       400:
 *         description: Bad request. Invalid or missing `id_zone` parameter or Supabase error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                 detail:
 *                   type: string
 *                   description: Detailed error information.
 */
router.get("/vendeur/:id", authenticateToken, controllers.getVendeur);
module.exports = router;
