const express = require("express");
const controllers = require("../controllers/category/categoryController");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Add a new category
 *     description: Add a new category to the database.
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categorieName:
 *                 type: string
 *               status:
 *                 type: boolean
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 category:
 *                   type: object
 *                   properties:
 *                     categorieName:
 *                       type: string
 *                     status:
 *                       type: boolean
 *                     image:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Bad request.
 */
router.post("/", authenticateToken, controllers.addCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     description: Update the details of an existing category.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categorieName:
 *                 type: string
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Category updated successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Server error.
 */
router.put("/:id", authenticateToken, controllers.updateCategory);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Fetch a list of all categories.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of categories.
 *       500:
 *         description: Server error.
 */

router.get("/", authenticateToken, controllers.getCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a specific category
 *     description: Fetch a category by its ID.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single category.
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Server error.
 */
router.get("/:id", authenticateToken, controllers.getCategory);

/**
 * @swagger
 * /categories/{id}/status:
 *   put:
 *     summary: Update category status
 *     description: Change the status of a category.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category status updated successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Server error.
 */
router.put("/:id/status", authenticateToken, controllers.updateCategoryStatus);

/**
 * @swagger
 * /categories/{id}/produits:
 *   get:
 *     summary: Get all categories and produits for a specific user
 *     description: Fetch all categories associated with a user and the produits in each category.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of categories with produits.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   categorieName:
 *                     type: string
 *                   status:
 *                     type: boolean
 *                   image:
 *                     type: string
 *                   description:
 *                     type: string
 *                   produits:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         productName:
 *                           type: string
 *                         price:
 *                           type: number
 *                           format: float
 *                         description:
 *                           type: string
 *       400:
 *         description: Bad request, invalid or missing user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User ID is required!
 *       404:
 *         description: No categories found for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No categories found for this user!
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.get(
  "/:id/produits",
  authenticateToken,
  controllers.getCategoriesWithProducts
);

/**
 * @swagger
 * /categories/assignVendeurToCategory:
 *   post:
 *     summary: Assign Multiple Vendeurs to a Single Category
 *     description: Assign multiple vendeurs to a specific category by inserting entries into the vendeur_category table.
 *     tags:
 *      - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId :
 *                  type: integer
 *                  description: The ID of the category to which vendeurs will be assigned.
 *               vendeurIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of vendeur IDs to assign to the category.
 *     responses:
 *       200:
 *         description: Vendeurs successfully assigned to category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vendeurIds:
 *                         type: array
 *                         items:
 *                            type: string
 *                       id_category:
 *                         type: string
 *       400:
 *         description: Bad request or validation error.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/assignVendeurToCategory",
  authenticateToken,
  controllers.assignVendeursToCategory
);
/**
 * @swagger
 * /categories/vendeurs/{id}:
 *   get:
 *     summary: Retrieve vendors for a specific category
 *     description: Fetches a list of vendors associated with a given category ID.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category to fetch vendors for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of vendors belonging to the specified category.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *       400:
 *         description: Missing or invalid category ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Category ID is required!"
 *       404:
 *         description: No vendors found for the given category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No vendeurs found for this category!"
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.get(
  "/vendeurs/:id",
  authenticateToken,
  controllers.getVendeursForCategory
);
module.exports = router;
