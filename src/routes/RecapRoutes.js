const express = require('express');
const controllers = require('../controllers/recap/recapControllers');
const Controllers = require('../controllers/Ventes/ventesControllers');
const users = require('../controllers/users/usersControllers');
const multer = require("multer");
const {authenticateToken} = require("../middleware/authenticateToken");
// Set up multer storage
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
/**
 * @swagger
 * /recap/sendRecap:
 *   post:
 *     summary: Generates a recap of ordered products with pricing details.
 *     description: Returns only the requested products with their respective pricing and total quantities.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *               - id_vendeur
 *             properties:
 *               data:
 *                 type: object
 *                 additionalProperties:
 *                   type: integer
 *                 example:
 *                   "product for me": 12
 *               id_vendeur:
 *                 type: string
 *                 format: uuid
 *                 example: "d2910324-8118-4abd-8fea-9565346661a3"
 *     responses:
 *       200:
 *         description: Successfully retrieved the order recap.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Produits_commandés:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           produit:
 *                             type: string
 *                             example: "product for me"
 *                           Quantité:
 *                             type: integer
 *                             example: 12
 *                           prix_collisage:
 *                             type: number
 *                             example: 100
 *                           Total:
 *                             type: number
 *                             example: 1200
 *                     total_Qunatite_Prod:
 *                       type: integer
 *                       example: 12
 *       400:
 *         description: Bad request due to missing or incorrect data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: data, id_vendeur"
 *       404:
 *         description: One or more requested products were not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "product for me not found"
 */
router.post('/sendRecap',authenticateToken, controllers.sendRecap);
/**
 * @swagger
 * /recap/pdf:
 *   post:
 *     summary: Générer et uploader une facture au format PDF
 *     description: Crée un fichier PDF avec les détails de la vente, l'upload sur Supabase et met à jour l'URL dans la base de données.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client
 *               - vendeur
 *               - echeance
 *               - produits
 *               - totalCommande
 *               - encaisse
 *               - id_vente
 *             properties:
 *               client:
 *                 type: string
 *                 description: Nom du client
 *               vendeur:
 *                 type: string
 *                 description: Nom du vendeur
 *               echeance:
 *                 type: string
 *                 format: date
 *                 description: Date d'échéance de la facture
 *               produits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - ref
 *                     - libelle
 *                     - colisage
 *                     - qte
 *                     - puPack
 *                     - valeurPack
 *                   properties:
 *                     ref:
 *                       type: string
 *                       description: Référence du produit
 *                     libelle:
 *                       type: string
 *                       description: Description du produit
 *                     colisage:
 *                       type: number
 *                       description: Nombre d'unités par colis
 *                     qte:
 *                       type: number
 *                       description: Quantité commandée
 *                     puPack:
 *                       type: number
 *                       format: float
 *                       description: Prix unitaire du pack
 *                     valeurPack:
 *                       type: number
 *                       format: float
 *                       description: Valeur totale du pack
 *               totalCommande:
 *                 type: number
 *                 format: float
 *                 description: Montant total de la commande
 *               encaisse:
 *                 type: number
 *                 format: float
 *                 description: Montant encaissé
 *               id_vente:
 *                 type: string
 *                 description: Identifiant unique de la vente
 *     responses:
 *       201:
 *         description: Facture créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Facture créée
 *                 pdfUrl:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/pdf',authenticateToken, Controllers.generatePdf);
/**
 * @swagger
 * /recap/uploadQr:
 *   post:
 *     summary: Upload a QR code image for a client
 *     description: Uploads an image file to Supabase storage and updates the user's Qr_code field with the file URL.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id_client
 *               - file
 *             properties:
 *               id_client:
 *                 type: string
 *                 description: The unique ID of the client
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to be uploaded
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully"
 *                 fileUrl:
 *                   type: string
 *                   example: "https://xyz.supabase.co/storage/v1/object/public/factures/12345/qrcode.png"
 *       400:
 *         description: Missing required fields or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "id_client and image file are required!"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 details:
 *                   type: string
 *                   example: "Error details here"
 */
router.post('/uploadQr',authenticateToken,upload.single('file'),  users.uploadQr)
router.post('/uploadFile',authenticateToken,upload.single('file'), users.uploadFile);
module.exports = router;