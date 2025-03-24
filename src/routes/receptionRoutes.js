const express = require('express');
const receptions = require('../controllers/reception/receptionControllers');
const {authenticateToken} = require("../middleware/authenticateToken");
const router = express.Router();
/**
   * @swagger
   * /receptions:
   *   get:
   *     summary: Get all receptions
   *     description: Retrieves a list of all receptions, including associated user data.
   *     tags: 
   *       - Receptions 
   *     responses:
   *       200:
   *         description: A list of receptions.
   *       400:
   *         description: Bad request error.
   *       404:
   *         description: No receptions found.
   *       500:
   *         description: Internal server error.
   */
router.get('/',authenticateToken, receptions.getReceptions);
 /**
   * @swagger
   * /receptions/{id}:
   *   put:
   *     summary: Update a reception
   *     description: Updates the status and updatedBy fields of a reception.
   *     tags: 
   *       - Receptions
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Reception ID.
   *         schema:
   *           type: string
   *       - in: body
   *         name: body
   *         required: true
   *         description: Reception update payload.
   *         schema:
   *           type: object
   *           required:
   *             - status
   *             - updatedBy
   *           properties:
   *             status:
   *               type: string
   *               example: "completed"
   *             updatedBy:
   *               type: string
   *               example: "user123"
   *     responses:
   *       200:
   *         description: Reception updated successfully.
   *       400:
   *         description: Bad request (missing fields or invalid data).
   *       404:
   *         description: Reception not found.
   *       500:
   *         description: Internal server error.
   */
router.put('/:id',authenticateToken, receptions.updateReception);
module.exports = router;