const express = require('express');
const controllers = require('../controllers/demandes/demandesControllers');
const router = express.Router();
const {authenticateToken} = require("../middleware/authenticateToken");

/**
 * @swagger
 * /demandes/chargement-vehicule:
 *   post:
 *     summary: Créer une demande de chargement de véhicule
 *     description: Crée une nouvelle demande pour charger un véhicule avec les détails des produits.
 *     tags:
 *       - Demandes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_user
 *               - id_stock
 *               - source_stock
 *               - produits
 *             properties:
 *               id_user:
 *                 type: string
 *                 description: ID de l'utilisateur qui crée la demande
 *               id_stock:
 *                 type: string
 *                 description: ID du stock cible
 *               source_stock:
 *                 type: string
 *                 description: Source du stock
 *               produits:
 *                 type: array
 *                 description: Liste des produits à charger
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_produit
 *                     - quantite
 *                   properties:
 *                     id_produit:
 *                       type: string
 *                       description: ID du produit
 *                     quantite:
 *                       type: integer
 *                       description: Quantité du produit à charger
 *     responses:
 *       201:
 *         description: Demande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "demande and product quantities added successfully"
 *                 demande:
 *                   type: object
 *                   description: Détails de la demande créée
 *                 details:
 *                   type: array
 *                   description: Liste des détails des produits chargés
 *                   items:
 *                     type: object
 *       400:
 *         description: Champs obligatoires manquants ou erreur dans la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: id_user, produits, id_stock, source_stock"
 *       500:
 *         description: Erreur interne du serveur lors de l'insertion des détails de la demande
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to insert stock detail. Rolled back stock and stock details."
 */
router.post('/chargement-vehicule',authenticateToken, controllers.createDemande);
/**
 * @swagger
 * /demandes/chargement-entrepot:
 *   post:
 *     summary: Créer une demande de chargement d'entrepôt
 *     description: Crée une nouvelle demande pour charger un entrepôt avec les détails des produits.
 *     tags:
 *       - Demandes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_user
 *               - id_stock
 *               - source_stock
 *               - produits
 *             properties:
 *               id_user:
 *                 type: string
 *                 description: ID de l'utilisateur qui crée la demande
 *               id_stock:
 *                 type: string
 *                 description: ID de l'entrepôt cible
 *               source_stock:
 *                 type: string
 *                 description: Source du stock
 *               produits:
 *                 type: array
 *                 description: Liste des produits à charger
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_produit
 *                     - quantite
 *                   properties:
 *                     id_produit:
 *                       type: string
 *                       description: ID du produit
 *                     quantite:
 *                       type: integer
 *                       description: Quantité du produit à charger
 *     responses:
 *       201:
 *         description: Demande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "demande and product quantities added successfully"
 *                 demande:
 *                   type: object
 *                   description: Détails de la demande créée
 *                 details:
 *                   type: array
 *                   description: Liste des détails des produits chargés
 *                   items:
 *                     type: object
 *       400:
 *         description: Champs obligatoires manquants ou erreur dans la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: id_user, produits,id_stock,source_stock"
 *       500:
 *         description: Erreur interne du serveur lors de l'insertion des détails de la demande
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to insert stock detail. Rolled back stock and stock details."
 */
router.post('/chargement-entrepot',authenticateToken, controllers.demandeCEntrepot);
/**
 * @swagger
 * /demandes/interne:
 *   post:
 *     summary: Créer une demande interne de transfert
 *     description: Crée une nouvelle demande interne avec les détails des produits à transférer.
 *     tags:
 *       - Demandes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_user
 *               - id_stock
 *               - source_stock
 *               - produits
 *             properties:
 *               id_user:
 *                 type: string
 *                 description: ID de l'utilisateur qui crée la demande
 *               id_stock:
 *                 type: string
 *                 description: ID du stock cible
 *               source_stock:
 *                 type: string
 *                 description: Source du stock
 *               produits:
 *                 type: array
 *                 description: Liste des produits à transférer
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_produit
 *                     - quantite
 *                   properties:
 *                     id_produit:
 *                       type: string
 *                       description: ID du produit
 *                     quantite:
 *                       type: integer
 *                       description: Quantité du produit à transférer
 *     responses:
 *       201:
 *         description: Demande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "demande and product quantities added successfully"
 *                 demande:
 *                   type: object
 *                   description: Détails de la demande créée
 *                 details:
 *                   type: array
 *                   description: Liste des détails des produits transférés
 *                   items:
 *                     type: object
 *       400:
 *         description: Champs obligatoires manquants ou erreur dans la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: id_user,stock_source,id_stock produits"
 *       500:
 *         description: Erreur interne du serveur lors de l'insertion des détails de la demande
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to insert stock detail. Rolled back stock and stock details."
 */
router.post('/interne',authenticateToken, controllers.demandeInterne);
   /**
     * @swagger
     * /demandes:
     *   get:
     *     summary: Retrieve all demandes
     *     description: Fetches all demandes from the database.
     *     tags: [Demandes]
     *     responses:
     *       200:
     *         description: List of demandes
     *       404:
     *         description: No demandes found
     *       500:
     *         description: Server error
     */
router.get('/',authenticateToken, controllers.getDemandes);
/** 
 * @swagger
 * /demandes/{id}:
 *   get:
 *     summary: Retrieve a specific demande by ID
 *     description: Fetches a demande along with its associated user, stock, and product details.
 *     tags: 
 *       - Demandes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the demande to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the demande.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 type:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 user:
 *                   type: string
 *                 stock:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       produit:
 *                         type: string
 *                       quantite:
 *                         type: integer
 *       400:
 *         description: Invalid request or missing parameters.
 *       404:
 *         description: No demande found with the given ID.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id',authenticateToken, controllers.getoneDemande);
 /**
     * @swagger
     * /demandes/accept/{id}:
     *   put:
     *     summary: Accept a demande
     *     description: Updates a demande status to "accepted".
     *     tags: [Demandes]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         example: 5
     *         description: The ID of the demande to accept
     *     responses:
     *       200:
     *         description: Demande accepted successfully
     *       400:
     *         description: Missing required parameter
     *       404:
     *         description: Demande not found
     *       500:
     *         description: Server error
     */
router.put('/accept/:id',authenticateToken, controllers.acceptDemande);
   /**
     * @swagger
     * /demandes/reject/{id}:
     *   put:
     *     summary: Reject a demande
     *     description: Updates a demande status to "rejected".
     *     tags: [Demandes]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         example: 5
     *         description: The ID of the demande to reject
     *     responses:
     *       200:
     *         description: Demande rejected successfully
     *       400:
     *         description: Missing required parameter
     *       404:
     *         description: Demande not found
     *       500:
     *         description: Server error
     */
router.put('/reject/:id',authenticateToken, controllers.rejectDemande);
/**
 * @swagger
 * /demandes/affectDriver:
 *   post:
 *     summary: Assign a driver to a request
 *     description: Updates the request with the assigned driver ID and timestamps the modification.
 *     tags:
 *       - Demandes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - id_livreur
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the demande.
 *               id_livreur:
 *                 type: string
 *                 description: The ID of the assigned driver.
 *     responses:
 *       200:
 *         description: Driver successfully assigned.
 *       400:
 *         description: Missing required fields.
 *       404:
 *         description: Demande not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/affectDriver',authenticateToken, controllers.affectDriver);
  /**
     * @swagger
     * /demandes/{id}/valider-chargement:
     *   put:
     *     summary: Valide le chargement d'une demande
     *     description: Vérifie si les produits demandés sont en stock. Si un produit n'existe pas, une ligne est créée avec une quantité négative.
     *     tags:
     *       - Demandes
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID de la demande à valider
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Chargement validé avec succès
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Chargement validé avec succès"
     *       400:
     *         description: Erreur de validation ou problème serveur
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Demande is not awaiting loading"
     *       404:
     *         description: Demande ou détails introuvables
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Demande not found"
     */
router.put('/:id/valider-chargement',authenticateToken, controllers.validerChargement);
/**
 * @swagger
 * /demandes/validerReception/{id}:
 *   put:
 *     summary: Validate the reception of a delivery request
 *     description: This endpoint validates the reception of a delivery request by updating the stock and marking the request as completed.
 *     tags:
 *       - Demandes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the delivery request to validate.
 *     responses:
 *       200:
 *         description: Reception validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reception validé avec succès"
 *       400:
 *         description: Bad request (missing ID or incorrect status)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Demande is not loading in progress"
 *       404:
 *         description: Not found (Demande or stock details not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Demande not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.put('/validerReception/:id',authenticateToken, controllers.validerReception);
/**
 * @swagger
 * /demandes/demande_detail/{id}:
 *   put:
 *     summary: Update a demande detail's quantity
 *     description: Updates the quantity of a specific demande detail by its ID.
 *     tags:
 *       - Demandes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the demande detail to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantite
 *             properties:
 *               quantite:
 *                 type: integer
 *                 description: The new quantity to set for the demande detail.
 *     responses:
 *       200:
 *         description: Detail updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detail updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123"
 *                     quantite:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: quantite"
 *       404:
 *         description: Demande detail not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Detail not found"
 */
router.put('/demande_detail/:id',authenticateToken, controllers.updateDemandeDetail);
module.exports = router;