import express from "express";
import { insertProduct, getAllProducts, getProductById } from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", insertProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;