const express = require("express");
const Controllers = require("../controllers/Ventes/ventesControllers");
const detail = require("../controllers/Ventes/venteDetaills");
const { authenticateToken } = require("../middleware/authenticateToken");
const {
  cacheData,
  cacheMiddleware,
  redisClient,
} = require("../middleware/cacheMiddleware");
const router = express.Router();
/**
 * @swagger
 * /ventes:
 *   post:
 *     summary: Create a new vente
 *     description: Creates a new vente (sale) and adds product details.
 *     tags:
 *       - Ventes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_client
 *               - id_vendeur
 *               - totalCommande
 *               - montantEncaisse
 *               - produits
 *             properties:
 *               id_client:
 *                 type: string
 *                 format: uuid
 *                 example: "47dc411c-af13-4678-a47e-5b2b55fbd6b0"
 *               id_vendeur:
 *                 type: string
 *                 format: uuid
 *                 example: "d2910324-8118-4abd-8fea-9565346661a3"
 *               totalCommande:
 *                 type: number
 *                 example: 500.75
 *               montantEncaisse:
 *                 type: number
 *                 example: 0
 *               produits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_produit
 *                     - quantite
 *                   properties:
 *                     id_produit:
 *                       type: string
 *                       format: uuid
 *                       example: "3bd75f6d-9962-4b5b-9a7b-c094e4a8dd74"
 *                     quantite:
 *                       type: integer
 *                       example: 10
 *     responses:
 *       201:
 *         description: Vente created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vente created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     id_client:
 *                       type: string
 *                       format: uuid
 *                     id_vendeur:
 *                       type: string
 *                       format: uuid
 *                     total_commande:
 *                       type: number
 *                     montant_encaisse:
 *                       type: number
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_vente:
 *                             type: string
 *                             format: uuid
 *                           id_produit:
 *                             type: string
 *                             format: uuid
 *                           quantite:
 *                             type: integer
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
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
 */
router.post("/", authenticateToken, Controllers.createVente);
/**
 * @swagger
 * /ventes:
 *   get:
 *     summary: Retrieve all ventes (sales)
 *     description: Fetches a list of all ventes stored in the database.
 *     tags:
 *       - Ventes
 *     responses:
 *       200:
 *         description: A list of ventes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 10
 *                   id_client:
 *                     type: integer
 *                     example: 1
 *                   id_vendeur:
 *                     type: integer
 *                     example: 2
 *                   total_commande:
 *                     type: number
 *                     example: 500.75
 *                   montant_encaisse:
 *                     type: number
 *                     example: 500.00
 *       500:
 *         description: Internal Server Error
 */

router.get("/", authenticateToken, Controllers.getAllVent);

// router.get(
//   "/",
//   authenticateToken,
//   cacheMiddleware("all_ventes"),
//   async (req, res) => {
//     try {
//       const ventes = await Controllers.getAllVent();

//       if (!ventes || ventes.length === 0) {
//         console.log("No data found");
//       }

//       await redisClient.set("all_ventes", JSON.stringify(ventes), { EX: 3600 });
//       res.status(200).json(ventes);
//     } catch (error) {
//       console.error("Database Error:", error);
//       res.status(500).json({ error: "Server error" });
//     }
//   }
// );

/**
 * @swagger
 * /ventes/{id}:
 *   get:
 *     summary: Get a single vente by ID
 *     description: Fetches details of a specific vente using its ID.
 *     tags:
 *       - Ventes
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the vente to retrieve.
 *     responses:
 *       200:
 *         description: Details of the requested vente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 id_client:
 *                   type: integer
 *                   example: 1
 *                 id_vendeur:
 *                   type: integer
 *                   example: 2
 *                 total_commande:
 *                   type: number
 *                   example: 500.75
 *                 montant_encaisse:
 *                   type: number
 *                   example: 500.00
 *       404:
 *         description: ID is required
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", authenticateToken, Controllers.getOneVente);
router.put("/:id", authenticateToken, detail.updateDetail);
module.exports = router;
