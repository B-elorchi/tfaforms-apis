const express = require("express");
const transactions = require("../controllers/transaction/transactionController");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: multer.memoryStorage() });
const { authenticateToken } = require("../middleware/authenticateToken");
const {
  cacheMiddleware,
  redisClient,
} = require("../middleware/cacheMiddleware");
const router = express.Router();
/**
 * @swagger
 * /transactions/encaissement:
 *   post:
 *     summary: Create a new encaissement transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_vendeur
 *               - id_client
 *               - montant
 *             properties:
 *               id_vendeur:
 *                 type: string
 *                 description: ID of the seller
 *               id_client:
 *                 type: string
 *                 description: ID of the client
 *               montant:
 *                 type: number
 *                 description: Amount of the transaction
 *     responses:
 *       201:
 *         description: Transaction successfully created
 *       400:
 *         description: Missing required fields or database error
 *       500:
 *         description: Internal server error
 */
router.post("/encaissement", authenticateToken, transactions.encaissement);
/**
 * @swagger
 * /transactions/versement:
 *   post:
 *     summary: Create a new versement transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_vendeur
 *               - id_client
 *               - montant
 *               - bordereau
 *             properties:
 *               id_vendeur:
 *                 type: integer
 *                 description: ID of the seller
 *               id_client:
 *                 type: integer
 *                 description: ID of the client
 *               montant:
 *                 type: number
 *                 description: Amount of the transaction
 *               bordereau:
 *                 type: string
 *                 description: Proof document of the versement
 *     responses:
 *       201:
 *         description: Transaction successfully created
 *       400:
 *         description: Missing required fields or database error
 *       500:
 *         description: Internal server error
 */
router.post(
  "/versement",
  authenticateToken,
  upload.single("file"),
  transactions.versement
);
/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: API to manage transactions
 *
 * /transactions:
 *   get:
 *     summary: Get all transactions along with related client and vendor details
 *     description: Fetches a list of all transactions along with the client and vendor details using their foreign keys.
 *     tags:
 *       - Transactions
 *     responses:
 *       200:
 *         description: A list of transactions with associated client and vendor details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       montant:
 *                         type: number
 *                         format: float
 *                       type:
 *                         type: string
 *                       client:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       vendeur:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       400:
 *         description: Bad request. This may be caused by incorrect query or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error. An error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// router.get('/',authenticateToken, transactions.getAll);

// router.get(
//   "/",
//   authenticateToken,
//   cacheMiddleware("all_transactions"),
//   async (req, res) => {
//     try {
//       const allTransactions = await transactions.getAll(req);

//       if (!allTransactions.data || allTransactions.data.length === 0) {
//         console.log("No data found");
//       }

//       await redisClient.set(req.Key, JSON.stringify(allTransactions), {
//         EX: 3600,
//       });

//       res.status(200).json(allTransactions);
//     } catch (error) {
//       console.error("Database Error:", error);
//       res.status(500).json({ error: "Server error" });
//     }
//   }
router.get(
  "/",
  authenticateToken,
  // Remove the cacheMiddleware here
  async (req, res) => {
    try {
      const allTransactions = await transactions.getAll(req, res);
      
      // If controller already sent a response, don't continue
      if (res.headersSent) {
        return;
      }

      if (!allTransactions || !allTransactions.data || allTransactions.data.length === 0) {
        console.log("No data found");
      }

      // Remove the Redis caching code
      // await redisClient.set(req.Key, JSON.stringify(allTransactions), {
      //   EX: 3600,
      // });

      res.status(200).json(allTransactions);
    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);
// router.get(
//   "/",
//   authenticateToken, // Keep authentication
//   transactions.getAll // Pass the function reference, not a call
// );

module.exports = router;
