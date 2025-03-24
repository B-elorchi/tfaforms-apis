const express = require("express");
const controllers = require("../controllers/produits/produitControllers");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const {
  cacheMiddleware,
  redisClient,
} = require("../middleware/cacheMiddleware");

/**
 * @swagger
 * /produits:
 *   post:
 *     summary: Add a new produit
 *     description: Add a new produit to the database.
 *     tags:
 *       - Produits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reference:
 *                 type: string
 *                 description: Reference of the produit.
 *               nomProduit:
 *                 type: string
 *                 description: Name of the produit.
 *               colisage:
 *                 type: integer
 *                 description: Quantity per package.
 *               description:
 *                 type: string
 *                 description: Additional description of the produit.
 *               image:
 *                 type: string
 *                 description: Image of the produit.
 *               idCategory:
 *                  type: integer
 *                  description: Category of the produit.
 *               stock:
 *                  type: integer
 *                  description: Stock of the produit.
 *               weight_unit:
 *                  type: integer
 *                  description: Weight of the produit.
 *     responses:
 *       200:
 *         description: Produit added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 produit:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                     nomProduit:
 *                       type: string
 *                     colisage:
 *                       type: integer
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     idCategory:
 *                       type: integer
 *                     stock:
 *                       type: integer
 *                     weight_unit:
 *                       type: integer
 *       400:
 *         description: Bad request.
 */
router.post("/", authenticateToken, controllers.addProduit);

/**
 * @swagger
 * /produits/{id}:
 *   put:
 *     summary: Update a produit
 *     description: Update the details of an existing produit.
 *     tags:
 *       - Produits
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the produit to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reference:
 *                 type: string
 *               nomProduit:
 *                 type: string
 *               colisage:
 *                 type: integer
 *               status:
 *                 type: boolean
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               idCategory:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               weight_unit:
 *                 type: integer
 *               Last_modified:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp of last modification.

 *     responses:
 *       200:
 *         description: Produit updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 produit:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                     nomProduit:
 *                       type: string
 *                     colisage:
 *                       type: integer
 *                     status:
 *                       type: boolean
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     idCategory:
 *                       type: integer
 *                     stock:
 *                       type: integer
 *                     weight_unit:
 *                       type: integer
 *                     Last_modified:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of last modification.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Server error.
 */
router.put("/:id", authenticateToken, controllers.updateProduit);

/**
 * @swagger
 * /produits:
 *   get:
 *     summary: Get all produits
 *     description: Fetch a list of all produits.
 *     tags:
 *       - Produits
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number for pagination.
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of produits per page.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of produits.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   reference:
 *                     type: string
 *                   nomProduit:
 *                     type: string
 *                   colisage:
 *                     type: integer
 *                   description:
 *                     type: string
 *       500:
 *         description: Server error.
 */

// const cacheOptions = {
//   keyGenerator: (req) => "all_produits",
// };

// router.get(
//   "/",
//   authenticateToken,
//   cacheMiddleware("all_produits"),
//   async (req, res) => {
//     try {
//       const produits = await controllers.getProduits();
//       if (!produits || produits.length === 0) {
//         console.log("No data found");
//       }

//       await redisClient.set(req.Key, JSON.stringify(produits), {
//         EX: 3600,
//       });
//       res.status(200).json(produits);
//     } catch (error) {
//       console.error("Database Error:", error);
//       res.status(500).json({ error: "Server error" });
//     }
//   }
// );

router.get("/", authenticateToken, controllers.getProduits);

/**
 * @swagger
 * /produits/{id}:
 *   get:
 *     summary: Get a specific produit
 *     description: Fetch a produit by its ID.
 *     tags:
 *       - Produits
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the produit.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: A single produit.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reference:
 *                   type: string
 *                 nomProduit:
 *                   type: string
 *                 colisage:
 *                   type: integer
 *                 description:
 *                   type: string
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Produit not found.
 *       500:
 *         description: Server error.
 */
router.get("/:id", authenticateToken, controllers.getProduit);

/**
 * @swagger
 * /produits/assignCategory:
 *   put:
 *     summary: Assign a Category to a Product
 *     description: Updates the category of a specified product by assigning a new category ID.
 *     tags:
 *       - Produits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idProduit
 *               - idCategory
 *             properties:
 *               idProduit:
 *                 type: string
 *                 example: "12345"
 *                 description: The unique ID of the product to update.
 *               idCategory:
 *                 type: integer
 *                 example: 67890
 *                 description: The ID of the new category to assign.
 *     responses:
 *       200:
 *         description: Successfully updated the product category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category assigned successfully"
 *                 produit:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                       description: The updated product ID.
 *                     nomProduit:
 *                       type: string
 *                       example: "Product A"
 *                       description: The name of the product.
 *                     idCategory:
 *                       type: integer
 *                       example: "67890"
 *                       description: The new assigned category ID.
 *                     Last_modified:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-02-14T12:34:56Z"
 *                       description: The timestamp when the category was updated.
 *       400:
 *         description: Bad request - Invalid or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "idProduit and idCategory are required!"
 *       500:
 *         description: Internal Server Error - Something went wrong on the server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.put(
  "/assignCategory",
  authenticateToken,
  controllers.assignCategoryToProduct
);
router.post("/getIdProducts", authenticateToken, controllers.getIdProducts);
module.exports = router;
