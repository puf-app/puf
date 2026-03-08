/**
 * @swagger
 * tags:
 *   name: testRoutes
 *   description: Test functions to see if API works
 */

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /1:
 *   get:
 *     summary: First testRoutes route
 *     tags: [testRoutes]
 *     responses:
 *       201:
 *         description: OK
 *       301:
 *         description: Crash lol
 */
router.get("/1", (req, res) => {
  res.json({ 
    status: 200,
    message: "API 1 working",
    error: ""
  });
});
/**
 * @swagger
 * /2:
 *   get:
 *     summary: Second testRoutes route
 *     tags: [testRoutes]
 *     responses:
 *       202:
 *         description: OK
 *       302:
 *         description: Crash lol
 */
router.get("/2", (req, res) => {
  res.json({ 
    status: 200,
    message: "API 2 working",
    error: ""
  });
});
/**
 * @swagger
 * /:
 *   get:
 *     summary: Default testRoutes route
 *     tags: [testRoutes]
 *     responses:
 *       200:
 *         description: OK
 *       300:
 *         description: Crash lol
 */
router.get("", (req, res) => {
  res.json({ 
    status: 200,
    message: "API default working",
    error: ""
  });
});

module.exports = router;