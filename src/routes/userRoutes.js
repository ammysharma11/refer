// src/routes/userRoutes.js

const router = require("express").Router();
const { getAllUsers, getUserById, createUser } = require("../controllers/userController");

router.get("/",      getAllUsers);
router.get("/:id",   getUserById);
router.post("/",     createUser);

module.exports = router;

