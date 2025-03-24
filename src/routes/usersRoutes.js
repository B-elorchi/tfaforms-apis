const express = require("express");
const users = require("../controllers/users/usersControllers");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { authenticateToken } = require("../middleware/authenticateToken");
const { cacheMiddleware, cacheData } = require("../middleware/cacheMiddleware");
router.get('/roles', authenticateToken,users.getRoles)
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users with their roles
 *     description: Retrieves a list of all users along with their associated roles.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved list of users with their roles.
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
 *                       id_user:
 *                         type: string
 *                         format: uuid
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             format: email
 *                           phone:
 *                             type: string
 *                           address:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Bad request, error fetching users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get("/", authenticateToken, users.getAllUsersWithRoles);
  
// /**
//  * @swagger
//  * /users/clients:
//  *   get:
//  *     summary: Get a paginated list of clients
//  *     description: Fetches clients with pagination. You can control the page and limit using query parameters.
//  *     tags:
//  *       - Users
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: The page number to fetch.
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *         description: Number of clients per page.
//  *     responses:
//  *       200:
//  *         description: A paginated list of clients.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       id:
//  *                         type: integer
//  *                         description: The client ID.
//  *                       name:
//  *                         type: string
//  *                         description: The client's name.
//  *                 pagination:
//  *                   type: object
//  *                   properties:
//  *                     total:
//  *                       type: integer
//  *                       description: Total number of clients.
//  *                     page:
//  *                       type: integer
//  *                       description: Current page number.
//  *                     limit:
//  *                       type: integer
//  *                       description: Number of clients per page.
//  *                     totalPages:
//  *                       type: integer
//  *                       description: Total pages available.
//  *                     hasNextPage:
//  *                       type: boolean
//  *                       description: Indicates if there is a next page.
//  *                     hasPrevPage:
//  *                       type: boolean
//  *                       description: Indicates if there is a previous page.
//  *       400:
//  *         description: Bad request. Invalid parameters.
//  *       500:
//  *         description: Internal server error.
//  */


//router.get("/clients", authenticateToken, users.getClients);
/**
 * @swagger
 * /users/clients:
 *   get:
 *     summary: Get a list of clients
 *     description: Fetches all clients without pagination.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of clients.
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
 *                         type: integer
 *                         description: The client ID.
 *                       name:
 *                         type: string
 *                         description: The client's name.
 *                 total:
 *                   type: integer
 *                   description: Total number of clients.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */

router.get("/clients", authenticateToken, users.getClients);

/**
 * @swagger
 * /users/vendeurs:
 *   get:
 *     summary: Get all vendors
 *     description: Retrieves all users who have the role of a vendor.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved all vendors.
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
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *       400:
 *         description: Bad request. Could not retrieve vendors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

// router.get(
//   "/vendeurs",
//   authenticateToken,
//   cacheMiddleware(),
//   async (req, res) => {
//     try {
//       const vendeurs = await users.getVendeurs();
//       await cacheData(req.cacheKey, vendeurs);
//       res.status(200).json(vendeurs);
//     } catch (error) {
//       res.status(500).json({ error: "Server error" });
//     }
//   }
// );


router.get("/vendeurs", authenticateToken, users.getVendeurs);

// router.get(
//   "/vendeurs",
//   authenticateToken,
//   cacheMiddleware("all_vendeurs"),
//   async (req, res) => {
//     try {
//       const vendeurs = await users.getVendeurs();
//       if (!vendeurs || vendeurs.length === 0) {
//         console.log("No data found");
//       }

//       await redisClient.set(req.Key, JSON.stringify(vendeurs), {
//         EX: 3600,
//       });
//       res.status(200).json(vendeurs);
//     } catch (error) {
//       console.error("Database Error:", error);
//       res.status(500).json({ error: "Server error" });
//     }
//   }
// );

/**
 * @swagger
 * /users/clients/{id}:
 *   get:
 *     summary: Get a single client by ID
 *     description: Retrieves details of a specific client by their unique ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the client.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Successfully retrieved client details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       404:
 *         description: Client not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


/**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get user by ID
   *     description: Retrieve a user from the database by their ID.
   *     tags:
   *       - Users
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: The ID of the user to retrieve.
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully retrieved the user.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *       400:
   *         description: Bad request (missing or invalid ID).
   *       500:
   *         description: Internal server error.
   */
router.get("/:id",authenticateToken, users.getUserID)


router.get("/clients/:id", authenticateToken, users.getClientById);

/**
 * @swagger
 * /users/vendeurs/{id}:
 *   get:
 *     summary: Get a single vendor by ID
 *     description: Retrieves details of a specific vendor by their unique ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the vendor.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Successfully retrieved vendor details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       404:
 *         description: Vendor not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get("/vendeurs/:id", authenticateToken, users.getVendeurById);

/**
 * @swagger
 * /users/client:
 *   post:
 *     summary: Crée un nouveau client
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               name:
 *                 type: string
 *               geocode:
 *                 type: string
 *               address:
 *                 type: string
 *               created_by:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the user who created the client.
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Client créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 client:
 *                   type: object
 *       400:
 *         description: Champs manquants ou erreur dans la requête
 *       500:
 *         description: Erreur interne du serveur
 */

router.post("/client", authenticateToken, users.createClient);
/**
 * @swagger
 * /users/vendeur:
 *   post:
 *     summary: Crée un nouveau vendeur
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               name:
 *                 type: string
 *               zone:
 *                 type: string
 *               address:
 *                 type: string
 *               created_by:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the user who created the vendor.
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Vendeur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vendeur:
 *                   type: object
 *       400:
 *         description: Champs manquants ou erreur dans la requête
 *       500:
 *         description: Erreur interne du serveur
 */

router.post("/vendeur", authenticateToken, users.createVendeur);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided details and assigns roles if provided.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               statut:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               geoCode:
 *                 type: string
 *               infos:
 *                 type: string
 *               Qr_code:
 *                 type: string
 *               id_role:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *       400:
 *         description: Bad request, missing required fields or failed to insert data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post("/", authenticateToken, users.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update an existing user
 *     description: Updates user details based on the provided user ID. If `id_role` is provided, it replaces the user's roles.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update.
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
 *                 description: The updated name of the user.
 *               id_role:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of role IDs to assign to the user. If empty, roles remain unchanged.
 *               statut:
 *                 type: string
 *                 description: The status of the user.
 *               phone:
 *                 type: string
 *                 description: The phone number of the user.
 *               address:
 *                 type: string
 *                 description: The address of the user.
 *               geoCode:
 *                 type: string
 *                 description: The geolocation code of the user.
 *               infos:
 *                 type: string
 *                 description: Additional information about the user.
 *               Qr_code:
 *                 type: string
 *                 description: The QR code associated with the user.
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully!
 *                 user:
 *                   type: object
 *                   description: The updated user object.
 *       400:
 *         description: Bad request due to missing fields or validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User ID is required!
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found!
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
 *                 details:
 *                   type: string
 *                   description: More details about the server error.
 */
router.put("/:id", authenticateToken, users.updateUser);

/**
 * @swagger
 * /users/vendeurs/phone:
 *   post:
 *     summary: Retrieve a vendeur by phone number
 *     description: Fetches a user with the role of "vendeur" based on either their phone number.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: The phone number of the client.
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Vendeur found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "3f0917b2-5e6c-4969-95fd-cceef31f5a0b"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["vendeur"]
 *       400:
 *         description: Missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Either phone number is required!"
 *       404:
 *         description: Vendeur not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */

router.post("/vendeurs/phone", authenticateToken, users.vendeurParPhone);
/**
 * @swagger
 * /users/clients/phone:
 *   post:
 *     summary: Retrieve a client by phone number
 *     description: Fetches a user with the role of "client" based on either their phone number.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: The phone number of the client.
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Client found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "3f0917b2-5e6c-4969-95fd-cceef31f5a0b"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["client"]
 *       400:
 *         description: Missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Either phone number  is required!"
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */

router.post("/clients/phone", authenticateToken, users.clientParPhone);
/**
 * @swagger
 * /users/zones/{id}:
 *   get:
 *     summary: Get zones by vendor ID
 *     description: Retrieves all zones associated with a given vendor ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vendor ID
 *     responses:
 *       200:
 *         description: Successfully retrieved zones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_vendeur:
 *                   type: string
 *                   example: "12345"
 *                 zones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_zone:
 *                         type: string
 *                         example: "67890"
 *                       nom:
 *                         type: string
 *                         example: "Zone A"
 *       400:
 *         description: Bad request (missing or invalid ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "id is required!"
 *       500:
 *         description: Internal server error
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
 *                   example: "Error message details"
 */
router.get("/zones/:id", authenticateToken, users.getZones);
/**
 * @swagger
 * /users/stocks/{id}/{type}:
 *   get:
 *     summary: Get stocks for a specific responsable (vendor) and type
 *     description: Retrieve stock details associated with a specific responsable (vendor) and stock type.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the responsable (vendor)
 *         schema:
 *           type: string
 *       - in: path
 *         name: type
 *         required: true
 *         description: The type of stock (e.g., "Vehicule", "Warehouse")
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved stocks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Stock ID
 *                   responsable:
 *                     type: string
 *                     description: ID of the responsible vendor
 *                   type:
 *                     type: string
 *                     description: Type of stock (e.g., "Vehicule", "Warehouse")
 *                   quantite:
 *                     type: integer
 *                     description: Quantity of the stock available
 *       400:
 *         description: Invalid request (e.g., missing or invalid ID/type)
 *       404:
 *         description: No stocks found for the given responsable ID and type.
 *       500:
 *         description: Internal server error.
 */ router.get("/stocks/:id/:type", users.getStocks);
/**
 * @swagger
 * /users/upload-image:
 *   post:
 *     summary: Upload an image for a vendor
 *     description: Uploads an image to Supabase storage and updates the vendor's profile picture in the database.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - id_vendeur
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload.
 *               id_vendeur:
 *                 type: string
 *                 description: The ID of the vendor uploading the image.
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Image uploaded successfully and profile updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image uploaded successfully"
 *                 fileUrl:
 *                   type: string
 *                   example: "https://xyz.supabase.co/storage/v1/object/public/vendeur_images/sample.jpg"
 *       400:
 *         description: Bad request - Image file or vendor ID is missing, or error occurred during upload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Image is required!"
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
 *                   example: "Detailed error message here"
 */ router.post(
  "/upload-image",
  upload.single("file"),
  authenticateToken,
  users.addImage
);
module.exports = router;
